import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const limit = 300
const roots = process.argv.slice(2)

if (roots.length === 0) {
  console.error(
    'Usage: node scripts/check-feature-lines.mjs <feature-directory> [...]'
  )
  process.exit(2)
}

const sourceFiles = (path) => {
  if (statSync(path).isFile()) return /\.tsx?$/.test(path) ? [path] : []
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(path, entry.name)
    if (entry.isDirectory()) return sourceFiles(child)
    return entry.isFile() && /\.tsx?$/.test(entry.name) ? [child] : []
  })
}

const violations = roots
  .flatMap((root) => sourceFiles(resolve(root)))
  .flatMap((file) => {
    const content = readFileSync(file, 'utf8')
    const lines =
      content === ''
        ? 0
        : content.split('\n').length - Number(content.endsWith('\n'))
    return lines > limit ? [`${file}: ${lines} lines (limit ${limit})`] : []
  })

if (violations.length > 0) {
  console.error(violations.join('\n'))
  process.exit(1)
}

console.log(`All TypeScript files are within ${limit} lines.`)
