/* QR Review Business — Shared Data Layer V1
   File: data.js
   Purpose: One shared data source for all Admin Panel pages.
   Storage: localStorage on the same deployed origin.
*/
(function () {
  "use strict";

  const STORAGE_KEY = "qr_review_business_data_v1";

  const defaultData = {
    version: 1,
    settings: {
      businessName: "QR Review Business",
      currency: "INR",
      timezone: "Asia/Kolkata",
      plans: {
        basic: { name: "Basic", price: 29, duration: 30 },
        standard: { name: "Standard", price: 49, duration: 30 },
        premium: { name: "Premium", price: 99, duration: 30 }
      }
    },
    businesses: [
      {id:"QR-00128",name:"Caliber Library",owner:"Rahul",phone:"9876543210",type:"Library",plan:"standard",status:"Expiring Soon",expiry:"2026-09-24",scans:245,qrStatus:"Active",qrType:"Counter QR",reviewLink:"",address:"",created:"2026-08-20"},
      {id:"QR-00127",name:"Shree Salon",owner:"Shreya",phone:"9876501122",type:"Salon",plan:"basic",status:"Expiring Soon",expiry:"2026-09-25",scans:183,qrStatus:"Active",qrType:"Counter QR",reviewLink:"",address:"",created:"2026-08-20"},
      {id:"QR-00126",name:"Ayush Medical",owner:"Ayush",phone:"9876502211",type:"Medical",plan:"premium",status:"Expiring Soon",expiry:"2026-09-25",scans:421,qrStatus:"Active",qrType:"Bill QR",reviewLink:"",address:"",created:"2026-08-19"},
      {id:"QR-00125",name:"Gupta Garage",owner:"Rakesh",phone:"9876503311",type:"Garage",plan:"standard",status:"Expired",expiry:"2026-09-20",scans:312,qrStatus:"Disabled",qrType:"Poster QR",reviewLink:"",address:"",created:"2026-08-18"},
      {id:"QR-00124",name:"Priya Beauty",owner:"Priya",phone:"9876504411",type:"Salon",plan:"basic",status:"Expired",expiry:"2026-09-18",scans:198,qrStatus:"Disabled",qrType:"Counter QR",reviewLink:"",address:"",created:"2026-08-18"},
      {id:"QR-00123",name:"Metro Repairs",owner:"Mohit",phone:"9876505511",type:"Garage",plan:"premium",status:"Expired",expiry:"2026-09-17",scans:566,qrStatus:"Active",qrType:"Packaging QR",reviewLink:"",address:"",created:"2026-08-17"},
      {id:"QR-00122",name:"City Care Clinic",owner:"Neha",phone:"9876506611",type:"Medical",plan:"standard",status:"Active",expiry:"2026-10-15",scans:734,qrStatus:"Active",qrType:"Counter QR",reviewLink:"",address:"",created:"2026-08-15"},
      {id:"QR-00121",name:"Readers Point",owner:"Amit",phone:"9876507711",type:"Library",plan:"basic",status:"Active",expiry:"2026-10-28",scans:389,qrStatus:"Active",qrType:"Poster QR",reviewLink:"",address:"",created:"2026-08-14"},
      {id:"QR-00120",name:"Royal Family Restaurant",owner:"Vikas",phone:"9876508811",type:"Restaurant",plan:"premium",status:"Active",expiry:"2026-11-02",scans:892,qrStatus:"Active",qrType:"Table QR",reviewLink:"",address:"",created:"2026-08-12"},
      {id:"QR-00119",name:"Style Hub",owner:"Pooja",phone:"9876509911",type:"Salon",plan:"standard",status:"Suspended",expiry:"2026-09-30",scans:104,qrStatus:"Disabled",qrType:"Counter QR",reviewLink:"",address:"",created:"2026-08-10"}
    ],
    payments: [
      {id:"TXN-10028",businessId:"QR-00128",amount:49,method:"UPI",status:"Paid",date:"2026-09-22"},
      {id:"TXN-10027",businessId:"QR-00127",amount:29,method:"UPI",status:"Paid",date:"2026-09-22"},
      {id:"TXN-10026",businessId:"QR-00126",amount:99,method:"UPI",status:"Paid",date:"2026-09-21"},
      {id:"TXN-10025",businessId:"QR-00125",amount:49,method:"Cash",status:"Pending",date:"2026-09-20"},
      {id:"TXN-10024",businessId:"QR-00124",amount:29,method:"UPI",status:"Pending",date:"2026-09-18"}
    ],
    notifications: [],
    activityLogs: [],
    admins: [
      {id:"ADMIN-001",name:"Super Admin",email:"admin@qrreview.local",phone:"9876500001",role:"Super Admin",status:"Active"},
      {id:"ADMIN-002",name:"Admin Rahul",email:"rahul@qrreview.local",phone:"9876500002",role:"Admin",status:"Active"},
      {id:"ADMIN-003",name:"Support Admin",email:"support@qrreview.local",phone:"9876500003",role:"Support Admin",status:"Active"}
    ]
  };

  function clone(value){ return JSON.parse(JSON.stringify(value)); }

  function read(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw){
        const fresh=clone(defaultData);
        localStorage.setItem(STORAGE_KEY,JSON.stringify(fresh));
        return fresh;
      }
      return JSON.parse(raw);
    }catch(error){
      console.warn("QR Review Business storage read failed:",error);
      return clone(defaultData);
    }
  }

  function write(data){
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("qrReviewDataChanged",{detail:data}));
      return true;
    }catch(error){
      console.error("QR Review Business storage write failed:",error);
      return false;
    }
  }

  function getBusinesses(){ return read().businesses; }
  function getBusiness(id){ return getBusinesses().find(b=>b.id===id)||null; }

  function addBusiness(business){
    const data=read();
    const nums=data.businesses.map(b=>Number(String(b.id).replace(/\D/g,""))||0);
    const next=nums.length?Math.max(...nums)+1:1;
    const item={
      id:business.id||`QR-${String(next).padStart(5,"0")}`,
      name:business.name||"New Business",
      owner:business.owner||"",
      phone:business.phone||"",
      type:business.type||"Other",
      plan:business.plan||"basic",
      status:business.status||"Active",
      expiry:business.expiry||"",
      scans:Number(business.scans||0),
      qrStatus:business.qrStatus||"Active",
      qrType:business.qrType||"Counter QR",
      reviewLink:business.reviewLink||"",
      address:business.address||"",
      created:business.created||new Date().toISOString().slice(0,10)
    };
    data.businesses.unshift(item);
    write(data);
    return item;
  }

  function updateBusiness(id,patch){
    const data=read();
    const index=data.businesses.findIndex(b=>b.id===id);
    if(index===-1)return null;
    data.businesses[index]={...data.businesses[index],...patch};
    write(data);
    return data.businesses[index];
  }

  function removeBusiness(id){
    const data=read();
    data.businesses=data.businesses.filter(b=>b.id!==id);
    data.payments=data.payments.filter(p=>p.businessId!==id);
    write(data);
  }

  function addPayment(payment){
    const data=read();
    const item={
      id:payment.id||`TXN-${Date.now()}`,
      businessId:payment.businessId||"",
      amount:Number(payment.amount||0),
      method:payment.method||"UPI",
      status:payment.status||"Pending",
      date:payment.date||new Date().toISOString().slice(0,10)
    };
    data.payments.unshift(item);
    write(data);
    return item;
  }

  function addActivity(activity){
    const data=read();
    data.activityLogs.unshift({
      id:activity.id||`LOG-${Date.now()}`,
      activity:activity.activity||"System activity",
      admin:activity.admin||"Super Admin",
      businessId:activity.businessId||"",
      action:activity.action||"System",
      dateTime:activity.dateTime||new Date().toISOString()
    });
    data.activityLogs=data.activityLogs.slice(0,200);
    write(data);
  }

  function addNotification(notification){
    const data=read();
    data.notifications.unshift({
      id:notification.id||`NOT-${Date.now()}`,
      title:notification.title||"Notification",
      message:notification.message||"",
      businessId:notification.businessId||"",
      read:false,
      createdAt:notification.createdAt||new Date().toISOString()
    });
    write(data);
  }

  function getStats(){
    const data=read(),b=data.businesses,p=data.payments;
    return {
      totalBusinesses:b.length,
      active:b.filter(x=>x.status==="Active").length,
      expired:b.filter(x=>x.status==="Expired").length,
      suspended:b.filter(x=>x.status==="Suspended").length,
      totalScans:b.reduce((s,x)=>s+Number(x.scans||0),0),
      activeQR:b.filter(x=>x.qrStatus==="Active").length,
      disabledQR:b.filter(x=>x.qrStatus==="Disabled").length,
      revenue:p.filter(x=>x.status==="Paid").reduce((s,x)=>s+Number(x.amount||0),0),
      pendingAmount:p.filter(x=>x.status==="Pending").reduce((s,x)=>s+Number(x.amount||0),0)
    };
  }

  function resetDemoData(){
    const fresh=clone(defaultData);
    write(fresh);
    return fresh;
  }

  window.QRReviewData={
    STORAGE_KEY,defaultData:clone(defaultData),read,write,
    getBusinesses,getBusiness,addBusiness,updateBusiness,removeBusiness,
    addPayment,addActivity,addNotification,getStats,resetDemoData
  };

  window.addEventListener("storage",function(event){
    if(event.key===STORAGE_KEY)window.dispatchEvent(new CustomEvent("qrReviewDataChanged"));
  });
})();
