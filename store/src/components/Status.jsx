export default function Status({children,type='info'}){return <div className={`status status-${type}`}>{children}</div>}
