export function Skeleton({ className = '', height = 16, width = '100%', circle = false, style }) {
  return (
    <div
      className={['skeleton', className].join(' ')}
      style={{
        height,
        width,
        borderRadius: circle ? '9999px' : undefined,
        ...style,
      }}
    />
  );
}

export function WorkerCardSkeleton() {
  return (
    <div className="bg-bg border border-border rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton circle width={56} height={56} />
        <div className="flex-1 space-y-2">
          <Skeleton width="65%" height={14} />
          <Skeleton width="40%" height={11} />
        </div>
      </div>
      <Skeleton height={11} className="mb-2" />
      <Skeleton height={11} width="80%" className="mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton width={70} height={22} style={{ borderRadius: '999px' }} />
        <Skeleton width={50} height={14} />
      </div>
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-bg border border-border rounded-2xl p-5 shadow-soft">
      <div className="flex justify-between items-start mb-3">
        <Skeleton width="60%" height={18} />
        <Skeleton width={60} height={22} style={{ borderRadius: '999px' }} />
      </div>
      <Skeleton height={11} className="mb-2" />
      <Skeleton height={11} width="85%" className="mb-4" />
      <div className="flex gap-2">
        <Skeleton width={90} height={28} style={{ borderRadius: '999px' }} />
        <Skeleton width={90} height={28} style={{ borderRadius: '999px' }} />
      </div>
    </div>
  );
}
