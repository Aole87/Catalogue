import React from 'react';
import { ChevronLeft, Star, ShoppingCart, Share2, Heart, Search, Grid, Eye } from 'lucide-react';

const ProductDetail = ({ navigate, user, product }) => {
   if (!product) return <div>Product not found</div>;

   const getPrice = () => {
      if (!user) return 'Login to see price';
      let price = product.price_general;
      if (user.business_type === 'Garage') price = product.price_garage;
      if (user.business_type === 'Shop') price = product.price_shop;
      return `฿${price.toLocaleString()}`;
   };

   let specs = {};
   try {
      if (product.specifications) {
         specs = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
      }
   } catch (e) {
      console.error("Specs parsing error", e);
   }

   let crossRefs = [];
   try {
      if (product.cross_references) {
         crossRefs = typeof product.cross_references === 'string' ? JSON.parse(product.cross_references) : product.cross_references;
         if (!Array.isArray(crossRefs)) {
            crossRefs = [crossRefs];
         }
      }
   } catch (e) {
      if (product.cross_references) {
         crossRefs = product.cross_references.split(',').map(s => s.trim()).filter(Boolean);
      }
   }

   return (
      <div className="min-h-screen bg-[#F4F7F9]">
         {/* Header */}
         <header className="bg-white py-4 px-4 md:px-8 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm border-b sticky top-0 z-50">
            <div className="flex justify-between sm:justify-start items-center w-full sm:w-auto">
               <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
                  <div className="text-2xl font-black text-primary italic tracking-tighter">MOBEX</div>
               </div>
               {user && (
                  <div className="flex sm:hidden items-center gap-2">
                     <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold">{user.first_name[0]}</div>
                  </div>
               )}
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
               <div className="flex gap-4 md:gap-6 text-xs font-bold text-gray-800 shrink-0">
                  <button onClick={() => navigate('home')}>หน้าแรก</button>
                  <button onClick={() => navigate('product-list')}>ค้นหาอะไหล่</button>
                  <button>หมวดหมู่</button>
               </div>
               {user && (
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                     <span className="text-xs font-bold text-gray-400">{user.first_name} ({user.business_type})</span>
                     <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold">{user.first_name[0]}</div>
                  </div>
               )}
            </div>
         </header>

         <main className="max-w-7xl mx-auto py-6 md:py-10 px-4 sm:px-8">
            <div className="flex gap-4 items-center mb-6 md:mb-8 text-xs font-bold text-gray-400">
               <button onClick={() => navigate('product-list')} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <ChevronLeft className="w-4 h-4" /> กลับ / Back
               </button>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border p-4 md:p-10 flex flex-col lg:flex-row gap-8 lg:gap-16">
               {/* Left: Images & Reviews */}
               <div className="w-full lg:w-1/2 space-y-6 md:space-y-8">
                  <div className="aspect-[4/3] bg-[#F4F7F9] rounded-2xl flex items-center justify-center overflow-hidden relative border-2 border-gray-100">
                     <Grid className="w-16 h-16 md:w-20 md:h-20 text-gray-200" />
                  </div>
                  <div className="grid grid-cols-5 gap-2 md:gap-4">
                     {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`aspect-square bg-gray-50 rounded-xl border-2 cursor-pointer transition-all ${i === 1 ? 'border-primary' : 'border-gray-100'}`}></div>
                     ))}
                  </div>
               </div>

               {/* Right: Info */}
               <div className="w-full lg:w-1/2 space-y-6 md:space-y-8">
                  <div>
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 w-fit shrink-0">
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary">{product.brand_name || 'Brand'}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="flex text-secondary">
                           {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 fill-current ${i === 5 ? 'text-gray-200 fill-none' : ''}`} />)}
                        </div>
                        <span className="text-sm font-bold text-gray-400">4.8 (312)</span>
                     </div>
                  </div>

                  <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 md:p-6 relative overflow-hidden">
                     <div className="text-xs md:text-sm font-black text-red-800 mb-3 uppercase tracking-wider">อ้างอิงอะไหล่เทียบ (Cross-References)</div>
                     <div className="flex flex-wrap gap-2 items-center">
                        <span className="bg-white border-2 border-red-200 px-4 py-2 rounded-xl font-mono text-red-600 font-black text-base md:text-lg shadow-sm w-fit">#{product.code} (OEM)</span>
                        {crossRefs.map((ref, idx) => (
                           <span key={idx} className="bg-white border border-gray-200 px-4 py-2 rounded-xl font-mono text-gray-600 font-bold text-sm shadow-sm w-fit">{ref}</span>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                     <div className="space-y-6">
                        <div>
                           <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest border-b-2 border-primary/20 pb-2">รายละเอียดสินค้า</h3>
                           {product.description && (
                              <p className="text-xs text-gray-500 mb-3 font-normal leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{product.description}</p>
                           )}
                           <ul className="text-sm text-gray-500 space-y-2">
                              <li className="flex items-center gap-2 font-bold"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> ยี่ห้อรถ: {product.car_brand || '-'}</li>
                              <li className="flex items-center gap-2 font-bold"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> รุ่นรถ: {product.car_model || '-'}</li>
                              <li className="flex items-center gap-2 font-bold"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> ปี: {product.car_year || '-'}</li>
                           </ul>
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest border-b-2 border-primary/20 pb-2">Specifications</h3>
                           <div className="space-y-2">
                              {Object.keys(specs).length > 0 ? (
                                 Object.entries(specs).map(([key, val]) => (
                                    <div key={key} className="flex justify-between text-sm py-1 border-b border-dashed border-gray-100 last:border-none">
                                       <span className="text-gray-400 font-bold capitalize">{key.replace('_', ' ')}:</span>
                                       <span className="text-gray-800 font-black">{val}</span>
                                    </div>
                                 ))
                              ) : (
                                 <span className="text-xs text-gray-400 italic">No specifications provided</span>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest border-b-2 border-primary/20 pb-2">
                           ราคาของคุณ
                        </h3>
                        <div onClick={() => !user && navigate('login')}
                           className={`bg-[#ff6c60] text-white rounded-3xl p-6 md:p-8 text-center shadow-xl shadow-primary/20 ${!user ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                              }`}>
                           <div className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mb-2">
                              {user?.business_type || 'General'} Price
                           </div>

                           <div className={`${!user ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} font-black tracking-tighter`}>
                              {getPrice()}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">เปรียบเทียบกับอะไหล่เทียบอื่น</h3>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4 items-center">
                           <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0"><Grid className="w-6 h-6 text-gray-200" /></div>
                           <div className="flex-1">
                              <div className="flex items-center gap-1 mb-1">
                                 <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                 <span className="text-[10px] font-black text-gray-400 uppercase">TRW</span>
                              </div>
                              <div className="text-[11px] font-black text-gray-800 leading-tight mb-1">TRW DTEC Ceramic Brake Pads</div>
                              <div className="text-sm font-black text-primary">฿1,700.00</div>
                           </div>
                        </div>
                        <div className="w-full sm:w-32 bg-[#f1c40f] hover:bg-yellow-600 rounded-2xl p-4 text-center flex flex-col items-center justify-center text-white cursor-pointer shadow-lg shadow-secondary/20 shrink-0">
                           <div className="text-[10px] font-black uppercase leading-tight">ดูอะไหล่เทียบทั้งหมด</div>
                        </div>
                     </div>
                  </div>

                  {/* Shopping hidden as requested */}
                  <div className="pt-6 border-t">
                     <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Contact us for availability and ordering</p>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
};

export default ProductDetail;
