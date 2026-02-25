function ConfirmDialog({ message, onConfirm, onCancel }) {
    if (!message) return null;

    return (
        <div className="dialog-overlay" onClick={onCancel}>
            <div className="dialog-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                <h3 className="dialog-title">确认操作</h3>
                <p style={{ margin: '12px 0 24px', color: 'var(--text-secondary, #aaa)', lineHeight: 1.6 }}>
                    {message}
                </p>
                <div className="dialog-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>取消</button>
                    <button className="btn btn-primary" onClick={onConfirm}>确认</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
