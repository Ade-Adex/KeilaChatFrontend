import React from 'react'

const TypingIndicator = () => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        padding: '10px 14px',
        backgroundColor: '#333',
        borderRadius: '12px 12px 12px 0',
        width: 'fit-content',
        alignSelf: 'flex-start',
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#888',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default TypingIndicator
