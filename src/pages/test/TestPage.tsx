const DEPLOY_VERSION = 1

const TestPage = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'monospace', background: '#f5f5f5' }}>
            <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h1 style={{ fontSize: 48, margin: 0, color: '#1890ff' }}>✅ Deploy OK</h1>
                <p style={{ fontSize: 24, color: '#666', marginTop: 12 }}>Version: <strong>{DEPLOY_VERSION}</strong></p>
                <p style={{ fontSize: 14, color: '#999' }}>Build: {DEPLOY_VERSION}</p>
            </div>
        </div>
    )
}

export default TestPage
