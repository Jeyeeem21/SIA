import React from 'react';
import Modal from './Modal';
import { Plus } from 'lucide-react';

const AddOrderModal = ({
  isOpen,
  onClose,
  orderForm,
  setOrderForm,
  currentItem,
  setCurrentItem,
  products,
  addItemToOrder,
  removeItemFromOrder,
  handleSubmitOrder
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Order"
      size="lg"
      headerGradient="from-cyan-600 to-teal-600"
    >
      <div className="p-6 space-y-6 flex-1">
        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Name (Optional)</label>
            <input
              type="text"
              value={orderForm.customer_name}
              onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400"
              placeholder="Walk-in customer if empty"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Pickup Date</label>
            <input
              type="date"
              value={orderForm.preferred_pickup_date}
              onChange={(e) => setOrderForm({ ...orderForm, preferred_pickup_date: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
              style={{ colorScheme: 'light' }}
            />
          </div>
        </div>

        {/* Add Products Section */}
        <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Add Products to Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Product <span className="text-red-500">*</span></label>
              <select
                value={currentItem.product_id}
                onChange={(e) => {
                  const val = e.target.value;
                  const product = products.find(p => p.product_id == val);
                  setCurrentItem({ ...currentItem, product_id: val, unit_price: product?.price || 0 });
                }}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                style={{ color: '#0f172a' }}
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.product_id} value={product.product_id}>{product.product_name} - ₱{product.price}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={currentItem.quantity} onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })} className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white" style={{ color: '#0f172a' }} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Unit Price</label>
              <input type="number" step="0.01" value={currentItem.unit_price} onChange={(e) => setCurrentItem({ ...currentItem, unit_price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white" style={{ color: '#0f172a' }} />
            </div>
          </div>

          <button onClick={addItemToOrder} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all flex items-center gap-2"><Plus className="w-4 h-4"/> Add Product</button>
        </div>

        {/* Order Items List */}
        {orderForm.order_items.length > 0 && (
          <div className="border-2 border-slate-200 rounded-xl p-4">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Order Items</h3>
            <div className="space-y-2">
              {orderForm.order_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.product_name}</p>
                    <p className="text-sm text-slate-600">{item.quantity} × ₱{item.unit_price.toLocaleString()} = ₱{(item.quantity * item.unit_price).toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeItemFromOrder(index)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all">Remove</button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">Total Amount:</span>
                <span className="text-2xl font-bold text-amber-600">₱{orderForm.order_items.reduce((sum, it) => sum + (it.quantity * it.unit_price), 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
          <textarea value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} rows="3" className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400" placeholder="Add any special instructions..." style={{ color: '#0f172a' }} />
        </div>

      <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t border-slate-200 flex-shrink-0">
        <button onClick={() => { onClose(); setOrderForm({ customer_name: '', notes: '', preferred_pickup_date: new Date().toISOString().split('T')[0], order_items: [] }); }} className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all">Cancel</button>
        <button onClick={handleSubmitOrder} disabled={orderForm.order_items.length === 0} className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">Create Order</button>
      </div>

      </div>
    </Modal>
  );
};

export default AddOrderModal;
