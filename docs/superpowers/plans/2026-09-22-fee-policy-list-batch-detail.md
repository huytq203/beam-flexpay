# Fee Policy List Batch Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the fee-policy table expandable while loading every assignment, component, and tier for the current page in one search HTTP request, with multi-expand/open-all support and payer/beneficiary readouts.

**Architecture:** The backend adds opt-in `includeConfiguration=true` enrichment to the existing paginated search response and loads assignments, components, and tiers with three batch repository calls. The frontend requests that aggregate once, stores expansion as a set of current-page policy IDs, and renders nested configuration directly from each row without lazy detail calls.

**Tech Stack:** Java 25, Spring Boot 3.5, Spring Data JPA, JUnit 5, Mockito, React 19, TypeScript, RTK Query, Ant Design wrapper components, Vitest, Testing Library, MSW.

**Spec:** `docs/superpowers/specs/2026-09-22-fee-policy-list-batch-detail-design.md`

## Global Constraints

- Preserve unrelated dirty-worktree changes in both repositories; stage only files owned by the current task.
- Keep `GET /api/v1/admin/fee/policies/search` backward compatible when `includeConfiguration` is absent or false.
- Do not add database migrations or JPA relationships.
- Do not call a repository or HTTP endpoint inside a policy/component loop.
- Return empty arrays, never `null`, inside requested configuration.
- Keep all existing table columns, permissions, actions, filters, export, refresh, and pagination.
- “Mở tất cả” applies only to rows on the current page.
- Backend must be deployable before the frontend starts requesting the aggregate.

---

### Task 1: Backend batch configuration assembler

**Files:**

- Create: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/main/java/com/flexpay/fee/application/dto/response/feepolicy/FeePolicyConfigurationResponse.java`
- Create: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/main/java/com/flexpay/fee/application/dto/response/feepolicy/FeePolicyComponentDetailResponse.java`
- Create: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/main/java/com/flexpay/fee/application/service/impl/fee/FeePolicyConfigurationAssembler.java`
- Create: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/test/java/com/flexpay/fee/application/service/impl/fee/FeePolicyConfigurationAssemblerTest.java`
- Modify: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/main/java/com/flexpay/fee/application/dto/response/feepolicy/FeePolicyResponse.java`

**Interfaces:**

- Consumes: `FeePolicyAssignmentRepository.findByFeePolicyIdIn(Collection<UUID>)`, `FeePolicyComponentRepository.findByFeePolicyIdIn(Collection<UUID>)`, `FeeComponentTierRepository.findByFeeComponentIdInOrderByMinValueAsc(Collection<UUID>)`, and the three existing manual mappers.
- Produces: `Map<UUID, FeePolicyConfigurationResponse> FeePolicyConfigurationAssembler.assemble(List<UUID> policyIds)` and nullable `FeePolicyResponse.configuration` omitted from JSON when not requested.

- [ ] **Step 1: Write the failing assembler tests**

Create tests covering two policies, multiple assignments, multiple components, tier grouping/order, empty arrays, empty policy input, and no tier call when components are empty. The main assertion shape is:

```java
Map<UUID, FeePolicyConfigurationResponse> result = assembler.assemble(
        List.of(firstPolicyId, secondPolicyId));

assertThat(result.get(firstPolicyId).getAssignments())
        .extracting(FeePolicyAssignmentResponse::getId)
        .containsExactly(firstAssignmentId, secondAssignmentId);
assertThat(result.get(firstPolicyId).getComponents().getFirst().getTiers())
        .extracting(FeeComponentTierResponse::getMinValue)
        .containsExactly(new BigDecimal("0"), new BigDecimal("100001"));
assertThat(result.get(secondPolicyId).getAssignments()).isEmpty();
verify(assignmentRepository).findByFeePolicyIdIn(List.of(firstPolicyId, secondPolicyId));
verify(componentRepository).findByFeePolicyIdIn(List.of(firstPolicyId, secondPolicyId));
verify(tierRepository).findByFeeComponentIdInOrderByMinValueAsc(componentIds);
```

For empty input:

```java
assertThat(assembler.assemble(List.of())).isEmpty();
verifyNoInteractions(assignmentRepository, componentRepository, tierRepository);
```

- [ ] **Step 2: Run the assembler test to verify RED**

Run:

```bash
cd /home/huytq/code/beam/be/flexpay/flexpay.fee
./gradlew test --tests '*FeePolicyConfigurationAssemblerTest'
```

Expected: compilation fails because the DTOs and assembler do not exist.

- [ ] **Step 3: Add aggregate DTOs and the nullable policy field**

Implement:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeePolicyConfigurationResponse {
    @Builder.Default
    private List<FeePolicyAssignmentResponse> assignments = List.of();
    @Builder.Default
    private List<FeePolicyComponentDetailResponse> components = List.of();
}
```

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeePolicyComponentDetailResponse {
    @JsonUnwrapped
    private FeePolicyComponentResponse component;
    @Builder.Default
    private List<FeeComponentTierResponse> tiers = List.of();
}
```

`@JsonUnwrapped` preserves the approved flattened JSON contract without changing
the existing component response DTO. Add to `FeePolicyResponse`:

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
private FeePolicyConfigurationResponse configuration;
```

- [ ] **Step 4: Implement the assembler with fixed batch calls**

Load assignments and components once, return empty configurations for all requested policies, skip the tier repository for zero components, and group by IDs. Sort assignments by `createdAt` then `id`; sort components by `componentType` then `id`; preserve the repository tier order inside each component.

The public method must retain this exact signature:

```java
public Map<UUID, FeePolicyConfigurationResponse> assemble(List<UUID> policyIds)
```

- [ ] **Step 5: Run the assembler tests to verify GREEN**

Run:

```bash
./gradlew test --tests '*FeePolicyConfigurationAssemblerTest'
```

Expected: all assembler tests pass and Mockito verifies one call per batch repository.

- [ ] **Step 6: Commit the backend assembler**

```bash
git add src/main/java/com/flexpay/fee/application/dto/response/feepolicy/FeePolicyConfigurationResponse.java \
  src/main/java/com/flexpay/fee/application/dto/response/feepolicy/FeePolicyComponentDetailResponse.java \
  src/main/java/com/flexpay/fee/application/dto/response/feepolicy/FeePolicyResponse.java \
  src/main/java/com/flexpay/fee/application/service/impl/fee/FeePolicyConfigurationAssembler.java \
  src/test/java/com/flexpay/fee/application/service/impl/fee/FeePolicyConfigurationAssemblerTest.java
git commit -m "feat: assemble fee policy configurations in batches"
```

### Task 2: Backend search contract and opt-in enrichment

**Files:**

- Modify: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/main/java/com/flexpay/fee/application/service/fee/IFeePolicyService.java`
- Modify: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/main/java/com/flexpay/fee/application/service/impl/fee/FeePolicyService.java`
- Modify: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/main/java/com/flexpay/fee/presentation/controller/v1/admin/fee/AdminFeePolicyController.java`
- Modify: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/test/java/com/flexpay/fee/application/service/impl/fee/FeePolicyServiceSearchTest.java`
- Create: `/home/huytq/code/beam/be/flexpay/flexpay.fee/src/test/java/com/flexpay/fee/presentation/controller/v1/admin/fee/FeePolicySearchConfigurationEndpointTest.java`

**Interfaces:**

- Consumes: `FeePolicyConfigurationAssembler.assemble(List<UUID>)` from Task 1.
- Produces: `IFeePolicyService.search(..., boolean includeConfiguration, Pageable pageable)` and query parameter `includeConfiguration=false` by default.

- [ ] **Step 1: Write failing service enrichment tests**

Extend `FeePolicyServiceSearchTest` with:

```java
var result = service.search(null, null, null, null, null, null,
        true, pageable);

assertThat(result.getContent().getFirst().getConfiguration())
        .isSameAs(configuration);
verify(configurationAssembler).assemble(List.of(policyId));
```

Add a false-path test:

```java
service.search(null, null, null, null, null, null, false, pageable);
verifyNoInteractions(configurationAssembler);
```

Update existing search calls in this test to pass `false`; keep `searchForExport` unchanged.

- [ ] **Step 2: Write the failing endpoint contract test**

Use reflection, matching the existing endpoint tests, to assert that the `search` method has a boolean parameter annotated as:

```java
@RequestParam(defaultValue = "false") boolean includeConfiguration
```

The test must find the annotation by the boolean parameter type/name rather than relying on a hard-coded parameter index.

- [ ] **Step 3: Run search tests to verify RED**

Run:

```bash
./gradlew test --tests '*FeePolicyServiceSearchTest' \
  --tests '*FeePolicySearchConfigurationEndpointTest'
```

Expected: compilation/signature failures for the missing flag and assembler dependency.

- [ ] **Step 4: Implement controller and service integration**

Change the service signature to:

```java
Page<FeePolicyResponse> search(
        String keyword,
        ServiceType serviceType,
        FeeDomain feeDomain,
        FeePolicyStatus status,
        String appliedTarget,
        String subjectKeyword,
        boolean includeConfiguration,
        Pageable pageable);
```

After current `appliedTargets` enrichment, add:

```java
if (includeConfiguration && !feePolicyPage.isEmpty()) {
    Map<UUID, FeePolicyConfigurationResponse> configurations =
            configurationAssembler.assemble(policyIds);
    responsePage.getContent().forEach(response -> response.setConfiguration(
            configurations.getOrDefault(
                    response.getId(),
                    FeePolicyConfigurationResponse.builder().build())));
}
```

Keep export on the internal path with configuration disabled. Update the controller invocation and OpenAPI description.

- [ ] **Step 5: Run focused backend tests to verify GREEN**

Run:

```bash
./gradlew test --tests '*FeePolicyConfigurationAssemblerTest' \
  --tests '*FeePolicyServiceSearchTest' \
  --tests '*FeePolicySearchConfigurationEndpointTest' \
  --tests '*FeeConfigurationExportServiceTest'
```

Expected: all selected tests pass.

- [ ] **Step 6: Run the backend test suite**

Run:

```bash
./gradlew test
```

Expected: exit code 0. If unrelated dirty-worktree tests fail, record exact test names and verify all owned tests remain green before continuing.

- [ ] **Step 7: Commit the backend endpoint integration**

Stage only the Task 2 files and commit:

```bash
git commit -m "feat: include configurations in fee policy search"
```

### Task 3: Frontend aggregate types, request flag, and cache tags

**Files:**

- Modify: `src/app/types/fee.type.ts`
- Modify: `src/app/services/apiFeePolicy.api.ts`
- Modify: `src/pages/fee-management/fee-policy-list/hooks/useFeePolicyList.ts`
- Create: `src/pages/fee-management/fee-policy-list/test/useFeePolicyListConfiguration.test.tsx`

**Interfaces:**

- Consumes: backend `FeePolicyResponse.configuration` from Task 2.
- Produces: `FeePolicyConfiguration`, nested `FeePolicyComponentWithTiers`, and `FeePolicy.configuration?: FeePolicyConfiguration`; every list search sends `includeConfiguration: true` and provides four cache tags.

- [ ] **Step 1: Write a failing request/cache test**

Render `FeePolicyList` with MSW, capture the search URL, and assert:

```ts
expect(new URL(request.url).searchParams.get('includeConfiguration')).toBe(
  'true'
)
expect(detailRequests).toEqual([])
```

Dispatch or trigger an assignment invalidation in a focused store test and assert the aggregate search endpoint refetches, proving the query provides `feeAssign` as well as the policy/component/tier tags.

- [ ] **Step 2: Run the new frontend test to verify RED**

Run:

```bash
yarn vitest run src/pages/fee-management/fee-policy-list/test/useFeePolicyListConfiguration.test.tsx
```

Expected: the request lacks `includeConfiguration=true` and/or does not refetch on the assignment tag.

- [ ] **Step 3: Add aggregate app types**

Define:

```ts
export interface FeePolicyComponentWithTiers extends FeePolicyComponent {
  tiers: FeeComponentTier[]
}

export interface FeePolicyConfiguration {
  assignments: FeeAssignment[]
  components: FeePolicyComponentWithTiers[]
}
```

Add `configuration?: FeePolicyConfiguration` to `FeePolicy`. Add `includeConfiguration?: boolean` and the currently used `subjectKeyword?: string` to `SearchFeePoliciesParams`.

- [ ] **Step 4: Send the opt-in flag and provide aggregate tags**

In `useFeePolicyList`, include:

```ts
includeConfiguration: true
```

Change `searchFeePolicies.providesTags` to:

```ts
providesTags: [
  'FeePolicy',
  'feeAssign',
  'FeePolicyComponent',
  'feeComponentTier'
]
```

- [ ] **Step 5: Run the request/cache test to verify GREEN**

Run the test from Step 2 and expect all cases to pass.

- [ ] **Step 6: Commit frontend data integration**

```bash
git add src/app/types/fee.type.ts src/app/services/apiFeePolicy.api.ts \
  src/pages/fee-management/fee-policy-list/hooks/useFeePolicyList.ts \
  src/pages/fee-management/fee-policy-list/test/useFeePolicyListConfiguration.test.tsx
git commit -m "feat: request batched fee policy configurations"
```

### Task 4: Render all assignments and payer/beneficiary from row data

**Files:**

- Modify: `src/pages/fee-management/fee-policy-list/components/FeePolicyExpandedDetail.tsx`
- Modify: `src/pages/fee-management/fee-config/components/FeeComponentReadout.tsx`
- Modify: `src/pages/fee-management/fee-config/constants/feeConfigFields.ts`
- Modify: `src/pages/fee-management/fee-policy-list/test/FeePolicyExpandedDetail.test.tsx`

**Interfaces:**

- Consumes: `FeePolicyConfiguration` and `AppliedTarget[]` from the row.
- Produces: a pure `FeePolicyExpandedDetail` with no API hook and a shared `FeeComponentReadout` that labels payer and beneficiary with raw-code fallback.

- [ ] **Step 1: Rewrite the expanded-detail test fixtures first**

Return `configuration` directly in the `/policies/search` fixture with two assignments and two components. Assert:

```ts
expect(within(detail).getAllByText('Đối tượng áp dụng')).toHaveLength(2)
expect(within(detail).getByText('Người dùng')).toBeInTheDocument()
expect(within(detail).getByText('Hệ thống')).toBeInTheDocument()
expect(within(detail).getByText('UNKNOWN_PAYER')).toBeInTheDocument()
```

Track requests and assert opening the row does not call URLs containing `policy-assignments/by-policy`, `policy-components/by-policy`, or `component-tiers/by-component`.

- [ ] **Step 2: Run the expanded-detail test to verify RED**

Run:

```bash
yarn vitest run src/pages/fee-management/fee-policy-list/test/FeePolicyExpandedDetail.test.tsx
```

Expected: current component still calls lazy detail APIs, shows only one assignment, and omits payer/beneficiary.

- [ ] **Step 3: Add beneficiary labels and payer fallback helpers**

Keep `PAYER_TYPE_LABEL`; add:

```ts
export const BENEFICIARY_TYPE_LABEL: Readonly<Record<string, string>> = {
  SYSTEM: 'Hệ thống',
  MERCHANT: 'Merchant',
  BANK: 'Ngân hàng',
  PARTNER: 'Đối tác',
  TAX: 'Cơ quan thuế'
}
```

Render both facts with `labelMap[value] ?? value ?? '—'`.

- [ ] **Step 4: Make expanded detail a pure row renderer**

Replace `policyId`/hook usage with:

```ts
interface FeePolicyExpandedDetailProps {
  policyName: string
  configuration: FeePolicyConfiguration | undefined
  appliedTargets?: AppliedTarget[]
}
```

Map every assignment into a compact bordered row. Reuse subject profile data by matching `subjectType` and `subjectId` across `appliedTargets`; otherwise show `subjectId`, `merchantId`, or the wildcard label. Map components through the existing `toReadoutComponent` logic moved into a small local pure helper, passing nested tiers.

Remove loading/error/retry branches because the parent search owns those states.

- [ ] **Step 5: Run expanded-detail tests to verify GREEN**

Run the test from Step 2. Expected: all assignments/components render and opening rows makes zero detail requests.

- [ ] **Step 6: Commit the pure detail renderer**

Stage only Task 4 files and commit:

```bash
git commit -m "feat: show complete fee configuration in expanded rows"
```

### Task 5: Multi-expand and page-level open/close all

**Files:**

- Modify: `src/pages/fee-management/fee-policy-list/FeePolicyList.tsx`
- Modify: `src/pages/fee-management/fee-policy-list/test/FeePolicyExpandedDetail.test.tsx`
- Delete: `src/pages/fee-management/fee-policy-list/hooks/useFeePolicyExpandedDetail.ts`

**Interfaces:**

- Consumes: `FeePolicyRow.configuration` from Tasks 3–4.
- Produces: `expandedPolicyIds: string[]`, independent row toggles, and current-page “Mở tất cả / Thu gọn tất cả”.

- [ ] **Step 1: Add failing multi-expand/open-all tests**

Assert that opening row one then row two leaves both regions mounted. Add a page-level button assertion:

```ts
await user.click(screen.getByRole('button', { name: 'Mở tất cả' }))
expect(screen.getAllByRole('region', { name: /Chi tiết/ })).toHaveLength(2)

await user.click(screen.getByRole('button', { name: 'Thu gọn tất cả' }))
expect(screen.queryAllByRole('region', { name: /Chi tiết/ })).toHaveLength(0)
```

Rerender through a filter/page URL change and assert expanded regions reset.

- [ ] **Step 2: Run the tests to verify RED**

Run:

```bash
yarn vitest run src/pages/fee-management/fee-policy-list/test/FeePolicyExpandedDetail.test.tsx
```

Expected: only one row can stay open and the page-level button is absent.

- [ ] **Step 3: Implement multi-expand state and controls**

Use:

```ts
const [expandedPolicyIds, setExpandedPolicyIds] = useState<string[]>([])
const pagePolicyIds = rows.map(({ id }) => id)
const allExpanded =
  pagePolicyIds.length > 0 && pagePolicyIds.every((id) => expandedPolicyIds.includes(id))
```

Toggle one ID without replacing the rest. Add the open/close-all button beside existing export/create actions. Reset with an effect keyed by the serialized effective query state (`feeDomain`, filters, `page`, `size`), not by `rows`, so background refetches do not collapse what the user is reading.

Pass `row.configuration` to `FeePolicyExpandedDetail`. Delete the unused lazy hook after `rg` confirms no consumers.

- [ ] **Step 4: Run multi-expand tests to verify GREEN**

Run the test from Step 2. Expected: multiple regions remain open, open/close all works, and query-state changes reset expansion.

- [ ] **Step 5: Run the fee-policy-list test directory**

Run:

```bash
yarn vitest run src/pages/fee-management/fee-policy-list/test
```

Expected: all fee-policy-list tests pass.

- [ ] **Step 6: Commit multi-expand behavior**

Stage only Task 5 files and commit:

```bash
git commit -m "feat: support expanding all fee policies"
```

### Task 6: Cross-repository verification and handoff

**Files:**

- Verify only; do not repair unrelated failures without explicit scope expansion.

**Interfaces:**

- Consumes: completed backend and frontend changes.
- Produces: fresh evidence for owned tests, lint, typecheck, and production builds, plus a precise list of unrelated pre-existing failures if any remain.

- [ ] **Step 1: Verify backend focused and full suites**

Run:

```bash
cd /home/huytq/code/beam/be/flexpay/flexpay.fee
./gradlew test --tests '*FeePolicyConfigurationAssemblerTest' \
  --tests '*FeePolicyServiceSearchTest' \
  --tests '*FeePolicySearchConfigurationEndpointTest'
./gradlew test
```

- [ ] **Step 2: Verify frontend focused tests**

Run:

```bash
cd /home/huytq/code/beam/fe/ewallet-cms-web
yarn vitest run src/pages/fee-management/fee-policy-list/test \
  src/pages/fee-management/fee-config/test/FeeComponentDialog.validation.test.tsx
```

- [ ] **Step 3: Verify frontend lint and types for owned files**

Run targeted ESLint over every modified frontend source/test file, then:

```bash
yarn typecheck
```

Expected target lint: exit code 0. The full typecheck must be reported honestly; before this feature it had known unrelated errors in `apiExportCsv.ts` and `useHandleInfoPolicy.tsx`.

- [ ] **Step 4: Verify production build and whitespace**

Run:

```bash
yarn build
git diff --check
git -C /home/huytq/code/beam/be/flexpay/flexpay.fee diff --check
```

Expected build: exit code 0. Attribute any unrelated dirty-worktree whitespace separately from owned-file whitespace.

- [ ] **Step 5: Review final diffs and report deployment order**

Confirm no unrelated files were staged or overwritten. Report backend-first deployment, API contract, one-request behavior, test counts, and any known unrelated failures.
