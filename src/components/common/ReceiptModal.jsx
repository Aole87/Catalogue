import React, { useRef } from 'react';
import { Printer, X, Download, CheckCircle2, Building2, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

/**
 * Converts numbers into Thai Baht text format (e.g. 1,250.00 -> หนึ่งพันสองร้อยห้าสิบบาทถ้วน)
 */
function thaiBahtText(num) {
  if (num === null || num === undefined || isNaN(num)) return 'ศูนย์บาทถ้วน';
  const numStr = Number(num).toFixed(2);
  const [intPart, decPart] = numStr.split('.');

  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function convertSection(s) {
    let res = '';
    const len = s.length;
    for (let i = 0; i < len; i++) {
      const d = parseInt(s[i]);
      const pos = len - i - 1;
      if (d !== 0) {
        if (pos === 1 && d === 1) res += '';
        else if (pos === 1 && d === 2) res += 'ยี่';
        else if (pos === 0 && d === 1 && len > 1 && parseInt(s[i - 1]) !== 0) res += 'เอ็ด';
        else res += digits[d];
        res += units[pos];
      }
    }
    return res;
  }

  let result = '';
  if (intPart.length > 6) {
    const millionPart = intPart.substring(0, intPart.length - 6);
    const lowerPart = intPart.substring(intPart.length - 6);
    result = convertSection(millionPart) + 'ล้าน' + convertSection(lowerPart) + 'บาท';
  } else {
    result = (convertSection(intPart) || 'ศูนย์') + 'บาท';
  }

  if (decPart === '00') {
    result += 'ถ้วน';
  } else {
    result += convertSection(decPart) + 'สตางค์';
  }

  return result;
}

export default function ReceiptModal({ order, isOpen, onClose }) {
  const { settings } = useSettings();
  const printRef = useRef(null);

  if (!isOpen || !order) return null;

  const storeInfo = settings?.storeInfo || {
    companyName: 'บริษัท โมเบ็กซ์ ออโต้พาร์ท จำกัด (สำนักงานใหญ่)',
    taxId: '0105565012345',
    branch: 'สำนักงานใหญ่ (00000)',
    phone: '02-123-4567, 081-234-5678',
    email: 'billing@mobex.co.th',
    address: '88/9 หมู่ 5 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
  };

  const receiptNo = order.receiptNumber || `REC-${order.orderNumber?.replace('#', '') || String(Date.now()).slice(-6)}`;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : new Date().toLocaleDateString('th-TH');

  const subtotal = Number(order.subtotal || order.totalAmount || 0);
  const shippingFee = Number(order.shippingTotal || order.shippingFee || 0);
  const discountTotal = Number(order.discountTotal || 0);
  const grandTotal = Number(order.grandTotal || (subtotal + shippingFee - discountTotal));
  
  // Standard Thai VAT 7% included in price calculation (ตามประมวลรัษฎากร: ราคารวม VAT)
  const vatRate = 0.07;
  const netBeforeVat = (grandTotal / (1 + vatRate));
  const vatAmount = (grandTotal - netBeforeVat);

  const items = order.items || order.orderItems || [
    {
      id: '1',
      productName: 'อะไหล่ยนต์ตามคำสั่งซื้อ',
      sku: 'PART-ITEM-01',
      quantity: 1,
      unitPrice: subtotal,
      totalPrice: subtotal,
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Top Control Bar (Screen Only) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ (Receipt / Tax Invoice)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ใบเสร็จ (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div ref={printRef} className="p-6 sm:p-10 bg-white text-slate-800 text-xs font-sans space-y-6 print:p-6">
          
          {/* Header Row: Company Details & Receipt Title */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-1.5 max-w-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0c3175] flex items-center justify-center text-white font-black text-xs">
                  M
                </div>
                <h1 className="text-base font-black text-[#0c3175] tracking-tight">
                  {storeInfo.companyName}
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {storeInfo.address}
              </p>
              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> <span className="font-mono">{storeInfo.taxId}</span> ({storeInfo.branch || 'สำนักงานใหญ่'})</div>
                <div><strong>โทร:</strong> {storeInfo.phone} | <strong>อีเมล:</strong> {storeInfo.email}</div>
              </div>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto self-start bg-slate-50 p-3.5 rounded-xl border border-slate-100 min-w-[220px]">
              <div className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">
                ใบเสร็จรับเงิน / ใบกำกับภาษี
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">
                RECEIPT / TAX INVOICE
              </div>
              <div className="text-xs space-y-1 text-slate-700">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">เลขที่:</span>
                  <span className="font-mono font-bold text-blue-700">{receiptNo}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">วันที่:</span>
                  <span className="font-semibold">{orderDate}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">อ้างอิง Order:</span>
                  <span className="font-mono font-semibold">{order.orderNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                ข้อมูลลูกค้า (Customer Details)
              </div>
              <div className="font-bold text-slate-900 text-xs">
                {order.customerName || order.shippingAddress?.fullName || 'ลูกค้าทั่วไป'}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                <div>เบอร์โทรศัพท์: {order.customerPhone || order.shippingAddress?.phone || '-'}</div>
                <div>
                  ที่อยู่: {[
                    order.shippingAddress?.addressLine1,
                    order.shippingAddress?.subdistrict,
                    order.shippingAddress?.district,
                    order.shippingAddress?.province,
                    order.shippingAddress?.postalCode
                  ].filter(Boolean).join(' ') || order.customerNotes || 'จัดส่งตามที่อยู่ที่ระบุในระบบ'}
                </div>
                {order.customerTaxId && (
                  <div>เลขประจำตัวผู้เสียภาษี: <span className="font-mono">{order.customerTaxId}</span></div>
                )}
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                ข้อมูลการชำระเงิน (Payment Status)
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ชำระเงินเรียบร้อยแล้ว (PAID)
                  </span>
                </div>
                <div className="text-slate-600">
                  <strong>ช่องทาง:</strong> {order.paymentMethod === 'promptpay' ? 'PromptPay (สแกนจ่าย QR)' : order.paymentMethod === 'bank_transfer' ? 'โอนเงินผ่านธนาคาร' : order.paymentMethod || 'PromptPay / Bank Transfer'}
                </div>
                <div className="text-slate-600">
                  <strong>วันที่ชำระ:</strong> {order.paidAt ? new Date(order.paidAt).toLocaleString('th-TH') : orderDate}
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">รายการสินค้า (Description)</th>
                  <th className="p-3 text-center w-20">จำนวน (Qty)</th>
                  <th className="p-3 text-right w-28">ราคา/หน่วย (฿)</th>
                  <th className="p-3 text-right w-28">จำนวนเงิน (฿)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {items.map((it, idx) => {
                  const name = it.productName || it.product?.name || it.name || 'สินค้าอะไหล่ยนต์';
                  const sku = it.sku || it.product?.sku || '-';
                  const variant = it.variantName || it.variant || it.skuName;
                  const qty = Number(it.quantity || 1);
                  const price = Number(it.unitPrice || it.price || 0);
                  const lineTotal = Number(it.totalPrice || (qty * price));

                  return (
                    <tr key={it.id || idx} className="hover:bg-slate-50/50">
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU: {sku} {variant && <span className="text-blue-600 font-semibold">• {variant}</span>}
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700 font-mono">{qty}</td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {lineTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Thai Baht Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start pt-2">
            {/* Thai Baht text & Warranty Note */}
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">จำนวนเงินตัวอักษร (Baht Text)</div>
                <div className="text-xs font-bold text-slate-800 leading-snug">
                  ({thaiBahtText(grandTotal)})
                </div>
              </div>
              <div className="text-[10px] text-slate-400 space-y-1">
                <div>* สินค้าอะไหล่แท้รับประกันคุณภาพตามมาตรฐานผู้ผลิต</div>
                <div>* ใบเสร็จรับเงินฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ที่ผ่านการชำระเงินแล้วอย่างสมบูรณ์</div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>รวมเป็นเงิน (Subtotal):</span>
                <span className="font-mono">฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>ส่วนลด (Discount):</span>
                  <span className="font-mono">-฿{discountTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>ค่าจัดส่ง (Shipping):</span>
                <span className="font-mono">{shippingFee === 0 ? 'ส่งฟรี (฿0.00)' : `฿${shippingFee.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                <span>มูลค่าสินค้าก่อน VAT:</span>
                <span className="font-mono">฿{netBeforeVat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>ภาษีมูลค่าเพิ่ม (VAT 7% รวมแล้ว):</span>
                <span className="font-mono">฿{vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#0c3175] pt-2 border-t-2 border-slate-300">
                <span>ยอดชำระสุทธิ (Grand Total):</span>
                <span className="font-mono text-base text-blue-700">
                  ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Footer Stamp */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs">
            <div className="space-y-8">
              <div className="text-slate-400 text-[11px]">ลงชื่อผู้รับสินค้า / ผู้รับบริการ</div>
              <div className="border-b border-dashed border-slate-400 w-40 mx-auto"></div>
              <div className="text-[11px] text-slate-500">(...................................................)</div>
            </div>
            <div className="space-y-8">
              <div className="text-slate-400 text-[11px]">ในนาม {storeInfo.companyName}</div>
              <div className="relative">
                <div className="border-b border-dashed border-slate-400 w-40 mx-auto"></div>
                {/* Visual Stamp Placeholder */}
                <div className="absolute -top-6 right-1/4 transform rotate-12 border-2 border-rose-500/70 text-rose-500 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest pointer-events-none opacity-80">
                  PAID ✓
                </div>
              </div>
              <div className="text-[11px] text-slate-500">ผู้มีอำนาจลงนาม / ฝ่ายการเงิน</div>
            </div>
          </div>

        </div>

        {/* Bottom Close Button (Screen Only) */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-all"
          >
            ปิดหน้าต่าง
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ใบเสร็จ (A4)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
