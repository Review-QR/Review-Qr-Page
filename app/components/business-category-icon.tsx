"use client";

const paths: Record<string, string[]> = {
  Store:["M3 9l1.5-5h15L21 9","M5 9v11h14V9","M3 9h18","M9 20v-6h6v6"],
  Utensils:["M3 2v7a4 4 0 0 0 4 4h0V2","M7 13v9","M21 2v20","M17 2v6a4 4 0 0 0 4 4"],
  HeartPulse:["M22 12h-4l-3 9L9 3l-3 9H2","M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21l8.84-8.61"],
  BookOpen:["M12 7v14","M3 18V5a2 2 0 0 1 2-2h4a3 3 0 0 1 3 3 3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v13","M3 18a2 2 0 0 0 2 2h4a3 3 0 0 1 3 1 3 3 0 0 1 3-1h4a2 2 0 0 0 2-2"],
  Scissors:["M6 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z","M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z","M8.12 8.12 12 12","M14.8 14.8 21 21","M8.12 15.88 12 12","M14.8 9.2 21 3"],
  Hotel:["M3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16","M3 7h18","M7 11h2","M15 11h2","M7 15h2","M15 15h2","M10 21v-4h4v4"],
  CarFront:["M5 17h14l1-5-2-5H6l-2 5 1 5Z","M5 17v3","M19 17v3","M4 12h16","M7 17h.01","M17 17h.01"],
  House:["m3 10 9-7 9 7","M5 9v12h14V9","M9 21v-7h6v7"],
  BriefcaseBusiness:["M3 7h18v14H3z","M8 7V4h8v3","M3 12h18","M10 12v2h4v-2"],
  WalletCards:["M3 5h18v15H3z","M3 8h18","M16 14h.01"],
  Laptop:["M4 5h16v11H4z","M2 20h20l-2-4H4z"],
  Clapperboard:["M4 3h16v18H4z","m4 7 16-4","m4 12 16-4","m8 4 3 3","m15 3 3 3"],
  Plane:["m22 2-7 20-4-9-9-4 20-7Z","M22 2 11 13"],
  PartyPopper:["M5.8 11.3 2 22l10.7-3.8","M14 3l1 3","M5 3l2 2","M22 8l-3 1","M15 14l.01.01"],
  Wheat:["M2 22 16 8","M7 17l-4-4","M10 14l-4-4","M13 11l-4-4","M16 8l-4-4","M9 20l-4-4"],
  UsersRound:["M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8","M20 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  Factory:["M2 20V8l7 4V8l7 4V4h6v16Z","M18 8h.01","M18 12h.01"],
  Coffee:["M10 2v2","M14 2v2","M4 7h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V7Z","M17 9h2a2 2 0 1 1 0 4h-2"],
};
export default function BusinessCategoryIcon({name,className=""}:{name:string;className?:string}) {
  const iconPaths=paths[name]??paths.Store;
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{iconPaths.map((d,index)=><path key={index} d={d}/>)}</svg>;
}
