import { useEffect, useRef } from 'react';

function LogPanel({ logs }) {
    const containerRef = useRef(null);

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    return (
        <section className="log-panel">
            <div className="log-header">
                <h2>📜 运行日志</h2>
                <span className="log-count">{logs.length} 条记录</span>
            </div>
            <div className="log-container" ref={containerRef}>
                {logs.length === 0 ? (
                    <div className="log-empty">暂无日志记录...</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className={`log-entry ${log.type}`}>
                            <span className="log-time">[{log.time}]</span>
                            <span className="log-message">{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

export default LogPanel;
