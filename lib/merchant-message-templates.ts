export type MessageCategory = "Festival" | "Offer" | "Announcement" | "New Product" | "Customer Appreciation" | "Seasonal";
export type MessageTemplate = { id: string; name: string; category: MessageCategory; relevance: string; title: string; message: string; cta: string; palette: string; motif: string };
const templates: MessageTemplate[] = [
  { id:"restaurant-festive",name:"Festive Table",category:"Festival",relevance:"Restaurant",title:"A festive meal, shared together",message:"Celebrate the season with a meal made for good company.",cta:"Plan your visit",palette:"from-orange-600 via-rose-600 to-amber-500",motif:"✦ 🍽 ✦" },
  { id:"restaurant-weekend",name:"Weekend Special",category:"Offer",relevance:"Restaurant",title:"Make this weekend delicious",message:"Drop by for your favourites and a little weekend treat.",cta:"View the menu",palette:"from-emerald-700 to-lime-500",motif:"🥗 ✧ 🍲" },
  { id:"hotel-festive",name:"Seasonal Escape",category:"Festival",relevance:"Hotel",title:"A little time away feels good",message:"Make room for a restful stay this season.",cta:"Explore your stay",palette:"from-sky-900 via-blue-700 to-amber-400",motif:"⌂ ✦ ☼" },
  { id:"hotel-update",name:"Guest Update",category:"Announcement",relevance:"Hotel",title:"A note for our guests",message:"We are ready to welcome you and make your stay comfortable.",cta:"Get in touch",palette:"from-indigo-900 to-sky-500",motif:"⌂ 〰 ✧" },
  { id:"salon-new",name:"New Service",category:"New Product",relevance:"Salon",title:"Something new for your self-care",message:"We have added a new way to enjoy a little time for yourself.",cta:"Discover more",palette:"from-fuchsia-700 via-rose-500 to-orange-300",motif:"✿ ✧ ♡" },
  { id:"salon-thanks",name:"Client Appreciation",category:"Customer Appreciation",relevance:"Salon",title:"A little note of thanks",message:"Thank you for making us part of your self-care routine.",cta:"Book a visit",palette:"from-violet-800 to-pink-400",motif:"♡ ✦ ✿" },
  { id:"sweet-festival",name:"Festival Mithai",category:"Festival",relevance:"Sweet Shop",title:"Share a little sweetness",message:"Celebrate together with fresh sweets for every gathering.",cta:"Explore the collection",palette:"from-rose-700 via-orange-500 to-yellow-400",motif:"✺ मिठाई ✺" },
  { id:"sweet-seasonal",name:"Seasonal Treats",category:"Seasonal",relevance:"Sweet Shop",title:"A season worth savouring",message:"Discover treats made for this special time of year.",cta:"See what is fresh",palette:"from-amber-700 to-pink-500",motif:"🍬 ✦ 🍥" },
  { id:"retail-arrival",name:"New Arrival",category:"New Product",relevance:"Retail",title:"Just arrived",message:"Take a look at the latest additions to our collection.",cta:"Browse now",palette:"from-slate-900 via-blue-800 to-cyan-500",motif:"✧ ◇ ✧" },
  { id:"retail-season",name:"Seasonal Edit",category:"Seasonal",relevance:"Retail",title:"A fresh seasonal edit",message:"Find something that fits the season and your style.",cta:"Explore the edit",palette:"from-teal-800 to-lime-500",motif:"◈ ✦ ◈" },
  { id:"universal-thanks",name:"A Thank You",category:"Customer Appreciation",relevance:"Every business",title:"Thank you for being here",message:"We appreciate your support and look forward to seeing you again.",cta:"Visit us again",palette:"from-blue-900 via-indigo-700 to-sky-400",motif:"✦ ♡ ✦" },
  { id:"universal-update",name:"Business Update",category:"Announcement",relevance:"Every business",title:"A quick update from us",message:"Here is something new we would like to share with you.",cta:"Learn more",palette:"from-amber-700 via-orange-500 to-rose-400",motif:"✧ ✦ ✧" },
  { id:"universal-festival",name:"Seasonal Celebration",category:"Festival",relevance:"Every business",title:"Celebrate the season with us",message:"Wishing you a bright season filled with moments worth sharing.",cta:"Discover more",palette:"from-purple-800 via-fuchsia-600 to-orange-400",motif:"✺ ✦ ✺" },
  { id:"universal-offer",name:"A Special Offer",category:"Offer",relevance:"Every business",title:"A little something for you",message:"Enjoy a special offer from our team, available for a limited time.",cta:"Explore the offer",palette:"from-emerald-800 via-teal-600 to-lime-400",motif:"✦ ◈ ✦" },
  { id:"universal-seasonal",name:"Seasonal Note",category:"Seasonal",relevance:"Every business",title:"A note for the season",message:"We have something timely to share with you.",cta:"Take a look",palette:"from-slate-800 via-cyan-700 to-sky-400",motif:"☼ ✧ ☼" },
  { id:"universal-new",name:"New This Season",category:"New Product",relevance:"Every business",title:"Something new is here",message:"Explore what is new at our business.",cta:"Discover it",palette:"from-indigo-800 via-blue-600 to-cyan-400",motif:"✧ ◇ ✧" },
];
export function templatesForBusiness(businessType: string | null): MessageTemplate[] {
  const type = (businessType ?? "").toLowerCase();
  const match = /restaurant|cafe|food/.test(type) ? "Restaurant" : /hotel|resort|stay/.test(type) ? "Hotel" : /salon|beauty|spa|barber/.test(type) ? "Salon" : /sweet|mithai|bakery|cake/.test(type) ? "Sweet Shop" : /retail|shop|store/.test(type) ? "Retail" : /clinic|medical|doctor|health/.test(type) ? "Medical" : "";
  const specific = match ? templates.filter((template) => template.relevance === match) : [];
  return [...specific, ...templates.filter((template) => template.relevance === "Every business")];
}
export function suggestMessage(prompt: string, tone: "Friendly"|"Premium"|"Festive"|"Short") {
  const context = prompt.trim().slice(0, 240);
  const title = tone === "Premium" ? "A thoughtful note for you" : tone === "Festive" ? "Celebrate with us" : tone === "Short" ? "A little update" : "A note from us";
  return { title, message: context ? `${context.replace(/[.!?\s]*$/, ".")}` : "We have something special to share with you.", cta: "Learn more" };
}
