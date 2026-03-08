const DEPLOY_VERSION = 19

const ENV_INFO = [
    { key: 'VITE_API_LOGIN', value: import.meta.env.VITE_API_LOGIN },
    { key: 'VITE_API_WALLETCORE', value: import.meta.env.VITE_API_WALLETCORE },
    { key: 'VITE_FEE_API_URL', value: import.meta.env.VITE_FEE_API_URL },
    { key: 'VITE_API_MERCHANT', value: import.meta.env.VITE_API_MERCHANT },
    { key: 'VITE_API_URL', value: import.meta.env.VITE_API_URL },
    { key: 'MODE', value: import.meta.env.MODE },
]

const TestPage = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'monospace', background: '#f5f5f5', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 640, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', padding: '32px 24px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <h1 style={{ fontSize: 40, margin: 0, color: '#1890ff' }}>✅ Deploy OK</h1>
                    <p style={{ fontSize: 20, color: '#444', margin: '8px 0 0' }}>Version: <strong>{DEPLOY_VERSION}</strong></p>
                </div>
                <div style={{ padding: 24 }}>
                    <p style={{ fontSize: 12, color: '#999', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>Environment Variables</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <tbody>
                            {ENV_INFO.map(({ key, value }) => (
                                <tr key={key} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '8px 12px 8px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{key}</td>
                                    <td style={{ padding: '8px 0', color: value ? '#389e0d' : '#cf1322', wordBreak: 'break-all' }}>
                                        {value || '⚠ undefined'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TestPage
