/* =====================================================================
   STORE SETTINGS — this is the only file you need to edit day to day.
   ===================================================================== */
window.STORE = {
  name: 'Glowell',            // shop name (used in order messages)
  currency: 'RWF',          // shown after every price: 35,000 RWF

  // WhatsApp number that receives orders: country code + number, digits only.
  // Example: '250788123456' (no +, no spaces). Leave '' to hide the button.
  whatsapp: '250784346538',

  // Contact email shown in the footer. Leave '' to hide.
  email: 'karemarsy@gmail.com',

  // MoMo number customers send money to (a normal MTN MoMo number).
  // After ordering they get a "Pay with MoMo" button that dials
  // *182*1*1*NUMBER*TOTAL# for them.
  momoNumber: '0784346538',
  momoName: '',             // the name registered on that MoMo number, so customers
                            // can check they're paying the right person
  // If you later get an MTN MoMo Pay merchant code, put it here.
  // It replaces the number above (customers dial *182*8*1*CODE#).
  momoCode: '',

  // Optional: an online card/MoMo payment page (e.g. Flutterwave or
  // IremboPay link). Shown as a "Pay online" button. Leave '' to hide.
  paymentLink: '',

  delivery: 'Kigali delivery in 24h. Other provinces in 2 to 3 days.',

  freeShipping: 50000,      // bag total (RWF) that unlocks free delivery (0 = hide)
  pairDiscount: 0.15,       // 15% off each "Better together" pair

  /* ---------------------------------------------------------------
     PRODUCTS
     kind:  'out' = skincare, 'in' = vitamins
     l1/l2: the two label lines printed on the drawn bottle
     b1/b2: background gradient colours, fg/on: text / button colours
     shape: 'dropper' | 'jar' | 'pump' | 'tube' | 'supp'  (drawn + animated)
     hero:  true = also featured in the big top section (keep it to ~7)
     cream: jar only, colour of the cream inside (default white)
     image: optional — 'images/serum.png' to use a real photo instead
            of the drawing (transparent PNG, square, ~1200px looks best)
     --------------------------------------------------------------- */
  products: [
    {id:'serum',hero:true,kind:'out',name:'Vitamin C Serum',l1:'Vitamin C',l2:'Serum',type:'Vitamin C serum',size:'30 ml',price:35000,
     one:'A stable 15% vitamin C serum for even, luminous skin.',ing:'Vitamin C, ferulic acid, vitamin E',use:'Apply 3 to 4 drops to clean skin each morning, before moisturizer.',
     b1:'#F0B545',b2:'#B9650F',fg:'#2B1604',on:'#FFE9C2',shape:'dropper',glass:'#E07A1F'},
    {id:'cream',hero:true,kind:'out',name:'Barrier Repair Cream',l1:'Barrier',l2:'Repair Cream',type:'Ceramide cream',size:'50 ml',price:28000,
     one:'A rich, fragrance-free cream that restores comfort to dry, reactive skin.',ing:'Ceramides, squalane, panthenol',use:'Apply morning and night as the last step of your routine.',
     b1:'#86A58A',b2:'#2F4B3A',fg:'#FFFFFF',on:'#2F4B3A',shape:'jar'},
    {id:'essence',hero:true,kind:'out',name:'Hyaluronic Essence',l1:'Hyaluronic',l2:'Essence',type:'Hyaluronic essence',size:'100 ml',price:24000,
     one:'A weightless essence layering three weights of hyaluronic acid.',ing:'Hyaluronic acid, panthenol, aloe',use:'Press two pumps into damp skin, then moisturize.',
     b1:'#4C74D9',b2:'#1A2C6E',fg:'#FFFFFF',on:'#1A2C6E',shape:'pump',glass:'#1E3F9E'},
    {id:'spf',hero:true,kind:'out',name:'Sunscreen SPF 50',l1:'SPF 50',l2:'Sunscreen',type:'Mineral sunscreen',size:'50 ml',price:18000,
     one:'Broad-spectrum SPF 50 that disappears on every skin tone, with no white cast.',ing:'Zinc oxide, niacinamide, vitamin E',use:'Apply generously as the last morning step. Reapply every 2 hours in the sun.',
     b1:'#F4A27E',b2:'#B1462B',fg:'#2E1108',on:'#FFE6D9',shape:'tube',glass:'#F7F1EA'},
    {id:'niacin',kind:'out',name:'Niacinamide Serum',l1:'Niacinamide',l2:'10% Serum',type:'Niacinamide + zinc serum',size:'30 ml',price:22000,
     one:'A clarifying serum that fades dark spots and evens out skin tone.',ing:'Niacinamide 10%, zinc PCA, tranexamic acid',use:'Apply 3 drops morning and night after cleansing.',
     b1:'#D9A38F',b2:'#7A3E34',fg:'#2C130E',on:'#FBE7DF',shape:'dropper',glass:'#B5654F'},
    {id:'cleanser',kind:'out',name:'Gentle Cleanser',l1:'Gentle',l2:'Cleanser',type:'Low-foam gel cleanser',size:'150 ml',price:14000,
     one:'A soft gel cleanser that lifts away dust and sunscreen without tightness.',ing:'Glycerin, oat extract, panthenol',use:'Massage one pump onto damp skin morning and night, then rinse.',
     b1:'#A7A9B8',b2:'#3E4157',fg:'#FFFFFF',on:'#3E4157',shape:'pump',glass:'#5A5F80'},
    {id:'shea',kind:'out',name:'Shea Body Butter',l1:'Shea',l2:'Body Butter',type:'Whipped body butter',size:'200 ml',price:16000,
     one:'Rich, whipped shea butter that keeps skin soft from head to toe.',ing:'Shea butter, coconut oil, vitamin E',use:'Warm a little between your palms and smooth over skin after a shower.',
     b1:'#D6B48A',b2:'#7A5532',fg:'#2A1A0B',on:'#F8EBD8',shape:'jar',cream:'#F3E2C0'},
    {id:'collagen',hero:true,kind:'in',name:'Collagen + Vitamin C',l1:'Collagen',l2:'+ Vitamin C',type:'Capsules',size:'60 capsules',price:30000,
     one:'Marine collagen peptides with vitamin C, in a once-daily serving.',ing:'Collagen peptides, vitamin C, hyaluronic acid',use:'Take two capsules daily with water and food.',
     b1:'#C24A6B',b2:'#5A1330',fg:'#FFFFFF',on:'#5A1330',shape:'supp',capA:'#C24A6B',capB:'#F6E9DC',gel:false},
    {id:'omega',hero:true,kind:'in',name:'Omega-3 Softgels',l1:'Omega-3',l2:'Softgels',type:'Algae-based softgels',size:'60 softgels',price:22000,
     one:'Plant-based EPA and DHA to support skin comfort and suppleness.',ing:'Algae oil (EPA, DHA), vitamin E',use:'Take two softgels daily with a meal.',
     b1:'#2A9AA0',b2:'#0A3B44',fg:'#FFFFFF',on:'#0A3B44',shape:'supp',gel:true},
    {id:'biotin',hero:true,kind:'in',name:'Biotin + Zinc',l1:'Biotin',l2:'+ Zinc',type:'Vegan capsules',size:'60 capsules',price:15000,
     one:'Biotin and zinc, which support normal skin, hair and nails.',ing:'Biotin, zinc bisglycinate',use:'Take one capsule daily with water.',
     b1:'#8466D8',b2:'#2E1B66',fg:'#FFFFFF',on:'#2E1B66',shape:'supp',capA:'#8466D8',capB:'#F6E9DC',gel:false},
    {id:'multi',kind:'in',name:'Daily Multivitamin',l1:'Daily',l2:'Multivitamin',type:'Capsules',size:'60 capsules',price:20000,
     one:'Thirteen vitamins and minerals in one daily capsule, to fill the gaps in a busy week.',ing:'Vitamins A, B, C, D, E, zinc, selenium',use:'Take one capsule daily with breakfast.',
     b1:'#6FA35A',b2:'#264A1C',fg:'#FFFFFF',on:'#264A1C',shape:'supp',capA:'#6FA35A',capB:'#F6E9DC',gel:false},
    {id:'iron',kind:'in',name:'Iron + Folate',l1:'Iron',l2:'+ Folate',type:'Gentle iron capsules',size:'60 capsules',price:12000,
     one:'A gentle, easy-on-the-stomach iron with folate and vitamin C.',ing:'Iron bisglycinate, folate, vitamin C',use:'Take one capsule daily with food. Keep out of reach of children.',
     b1:'#B8433A',b2:'#4E1612',fg:'#FFFFFF',on:'#4E1612',shape:'supp',capA:'#B8433A',capB:'#F6E9DC',gel:false},
    {id:'d3',kind:'in',name:'Vitamin D3 + K2',l1:'Vitamin D3',l2:'+ K2',type:'Softgels',size:'60 softgels',price:14000,
     one:'Vitamin D3 with K2, which support normal bones and immune function.',ing:'Vitamin D3 (cholecalciferol), vitamin K2 (MK-7), olive oil',use:'Take one softgel daily with a meal.',
     b1:'#E8C547',b2:'#8A6A0E',fg:'#2A2205',on:'#FFF3C4',shape:'supp',gel:true}
  ],

  /* "Better together" bundles — a and b are product ids from above */
  pairs: [
    {a:'serum',b:'collagen',title:'Brighten, inside and out',text:'Vitamin C works on the surface of your skin. Collagen peptides with vitamin C give your body the building blocks from within.'},
    {a:'cream',b:'omega',title:'Comfort for dry skin',text:'Ceramides rebuild the surface barrier while omega-3s support skin suppleness from the inside.'},
    {a:'essence',b:'biotin',title:'Hydrate and fortify',text:'Hyaluronic acid draws water into the skin. Biotin and zinc support the skin, hair and nails a cream can\'t reach.'},
    {a:'spf',b:'d3',title:'Sun-ready',text:'Sunscreen shields your skin from UV every day. Vitamin D3 with K2 keeps up the vitamin you\'d otherwise get from the sun.'},
    {a:'niacin',b:'multi',title:'Even tone, every day',text:'Niacinamide fades dark spots on the surface while a daily multivitamin covers the nutrients your skin draws on.'}
  ]
};
