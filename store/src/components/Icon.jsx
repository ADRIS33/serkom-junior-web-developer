import React from 'react';
const paths={
 bag:<><path d="M6 8h12l-1 13H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></>,
 search:<><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></>,
 user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6"/></>,
 arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,
 back:<path d="m15 18-6-6 6-6M9 12h10"/>,
 check:<path d="m5 12 4 4L19 6"/>,
 trash:<><path d="M4 7h16M10 11v6m4-6v6"/><path d="M7 7l1 14h8l1-14M9 7l1-3h4l1 3"/></>,
 edit:<><path d="m4 20 4-.8L19 8a2 2 0 0 0-3-3L5 16l-1 4Z"/><path d="m14 6 3 3"/></>,
 plus:<path d="M12 5v14M5 12h14"/>,
 minus:<path d="M5 12h14"/>,
 menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>,
 close:<path d="m6 6 12 12M18 6 6 18"/>,
 box:<><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></>,
 home:<><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></>,
 heart:<path d="M20 8.5c0 5.5-8 10-8 10s-8-4.5-8-10A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5Z"/>
};
export default function Icon({name,size=20,strokeWidth=1.8,className=''}){return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>}
