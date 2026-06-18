import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full bg-background py-12 flex justify-center items-center">
      <div className="text-[10px] uppercase text-foreground tracking-widest text-center opacity-80">
        © {new Date().getFullYear()} Keila Chat • All Rights Reserved
      </div>
    </footer>
  )
}

export default Footer
