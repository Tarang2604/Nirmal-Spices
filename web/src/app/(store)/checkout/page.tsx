"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  MapPin, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  ShoppingBag,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@/validators/auth.validator';

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, coupon, clearCart } = useCartStore();
  const { user, isLoggedIn } = useAuthStore();

  const [step, setStep] = useState<CheckoutStep>('address');
  const [selectedAddressIdx, setSelectedAddressIdx] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'standard'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Address Form setup (for guests or adding new address)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'home' as const,
      fullName: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    }
  });

  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [tempAddress, setTempAddress] = useState<any>(null);

  // Generate idempotency key on mount
  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
    if (items.length === 0) {
      toast.error("Your cart is empty! Add spices first.");
      router.push('/shop');
    }
  }, []);

  // Pre-select default address if user is logged in
  useEffect(() => {
    if (isLoggedIn && user?.addresses && user.addresses.length > 0) {
      const defaultIdx = user.addresses.findIndex(addr => addr.isDefault);
      setSelectedAddressIdx(defaultIdx !== -1 ? defaultIdx : 0);
      setShowAddressForm(false);
    } else {
      setShowAddressForm(true);
    }
  }, [user, isLoggedIn]);

  // Calculate pricing subtotal
  const subtotal = items.reduce((acc, item) => {
    const variant = item.product?.weights?.find(w => w.weight === item.weight);
    const itemPrice = variant ? variant.price : 0;
    return acc + itemPrice * item.qty;
  }, 0);

  const discount = coupon ? coupon.discount : 0;
  const shipping = subtotal - discount >= 499 ? 0 : 40;
  const codCharge = paymentMethod === 'cod' ? 20 : 0;
  const total = subtotal - discount + shipping + codCharge;

  // 1. Submit Address details step
  const handleAddressSubmit = (data: any) => {
    setTempAddress(data);
    setStep('shipping');
  };

  const proceedFromSavedAddress = () => {
    if (selectedAddressIdx === null || !user?.addresses[selectedAddressIdx]) {
      toast.error("Please select or add a delivery address");
      return;
    }
    setTempAddress(user.addresses[selectedAddressIdx]);
    setStep('shipping');
  };

  // 2. Submit Order creation
  const handlePlaceOrder = async () => {
    if (!tempAddress) {
      toast.error("Please complete the address step first");
      setStep('address');
      return;
    }

    setSubmittingOrder(true);
    try {
      // API call to create order in backend
      const res = await api.post(
        '/orders/create',
        {
          guestEmail: isLoggedIn ? undefined : guestEmail,
          guestPhone: isLoggedIn ? undefined : guestPhone,
          items: items.map(i => ({ product: i.product?._id, weight: i.weight, qty: i.qty })),
          address: tempAddress,
          paymentMethod,
          couponCode: coupon?.code
        },
        {
          headers: {
            'X-Idempotency-Key': idempotencyKey,
            'x-guest-session-id': localStorage.getItem('nirmal_cart_session_id') || ''
          }
        }
      );

      const orderData = res.data.data;

      if (paymentMethod === 'cod') {
        toast.success("Order placed successfully! COD confirmed.");
        // Store guest info for order confirmation page lookup
        if (!isLoggedIn && guestEmail) {
          localStorage.setItem('nirmal_guest_email', guestEmail);
        }
        await clearCart();
        setSubmittingOrder(false);
        router.push(`/order/${orderData.orderId}`);
      } else {
        // Trigger Razorpay SDK checkout flow
        const options = {
          key: orderData.key,
          amount: Math.round(total * 100),
          currency: 'INR',
          name: "Nirmal's Spices",
          description: "Premium Spice Harvests Purchase",
          image: '/spice_logo.png',
          order_id: orderData.razorpayOrderId,
          handler: async function (response: any) {
            setSubmittingOrder(true);
            try {
              // Verify payment signature
              const verifyRes = await api.post('/orders/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: orderData.orderId
              });
              
              toast.success("Payment verified! Order placed successfully.");
              await clearCart();
              router.push(`/order/${verifyRes.data.data.orderId}`);
            } catch {
              toast.error("Payment verification failed. Please contact support.");
            } finally {
              setSubmittingOrder(false);
            }
          },
          prefill: {
            name: user?.name || tempAddress.fullName,
            email: user?.email || guestEmail,
            contact: user?.phone || tempAddress.phone
          },
          theme: {
            color: "#C0392B"
          },
          modal: {
            ondismiss: function() {
              toast.warning("Payment modal dismissed. Order is pending payment.");
              setSubmittingOrder(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create order. Please try again.");
      setSubmittingOrder(false);
    }
  };

  const stepsList = [
    { value: 'address' as const, label: 'Delivery', icon: <MapPin size={16} /> },
    { value: 'shipping' as const, label: 'Shipping', icon: <Truck size={16} /> },
    { value: 'payment' as const, label: 'Payment', icon: <CreditCard size={16} /> },
    { value: 'review' as const, label: 'Review', icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 font-sans">
      {/* Razorpay Script Injection */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Progress timeline bar */}
      <div className="flex items-center justify-center gap-6 sm:gap-12 border-b border-border-spice/40 pb-6 mb-12 select-none">
        {stepsList.map((s, idx) => {
          const isActive = step === s.value;
          const isDone = ['address', 'shipping', 'payment', 'review'].indexOf(step) > idx;

          return (
            <div key={s.value} className="flex items-center gap-2">
              <span 
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors border",
                  isActive && "bg-primary border-primary text-white shadow-md shadow-crimson/15",
                  isDone && "bg-green-600 border-green-600 text-white",
                  !isActive && !isDone && "bg-white border-border text-muted-foreground"
                )}
              >
                {isDone ? "✓" : s.icon}
              </span>
              <span className={cn(
                "hidden sm:inline text-xs font-bold uppercase tracking-wider font-accent",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form screen columns */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-2xl border border-border-spice/40 shadow-sm flex flex-col gap-6">
          
          {/* Step 1: ADDRESS */}
          {step === 'address' && (
            <div className="flex flex-col gap-6">
              <h2 className="font-display font-bold text-xl text-charcoal flex items-center gap-2">
                <MapPin size={20} className="text-primary" /> Delivery Address
              </h2>

              {/* Guest Checkout Info Details */}
              {!isLoggedIn && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream/30 p-4 rounded-xl border border-border-spice/40">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Guest Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="bg-white border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Guest Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, ''))}
                      className="bg-white border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {/* Saved Addresses list */}
              {isLoggedIn && user?.addresses && user.addresses.length > 0 && !showAddressForm && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr, idx) => (
                      <button
                        key={addr._id}
                        onClick={() => setSelectedAddressIdx(idx)}
                        className={cn(
                          "p-4 rounded-xl border text-left flex flex-col gap-1.5 transition-colors outline-none",
                          selectedAddressIdx === idx
                            ? "border-primary bg-secondary/10"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs capitalize text-charcoal">{addr.label} Address</span>
                          {addr.isDefault && (
                            <span className="bg-secondary text-primary text-[8px] font-bold px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <span className="font-bold text-sm text-charcoal mt-1">{addr.fullName}</span>
                        <span className="text-xs text-muted-foreground">{addr.line1}, {addr.line2}</span>
                        <span className="text-xs text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</span>
                        <span className="text-xs text-muted-foreground font-semibold">📞 {addr.phone}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => { setShowAddressForm(true); reset(); }}
                    className="text-xs text-primary font-bold uppercase tracking-wider font-accent self-start hover:underline mt-2"
                  >
                    + Add New Address
                  </button>

                  <button
                    onClick={proceedFromSavedAddress}
                    className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 self-end mt-4 px-8 outline-none"
                  >
                    Deliver Here <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Address input form */}
              {(showAddressForm || !isLoggedIn) && (
                <form onSubmit={handleSubmit(handleAddressSubmit)} className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-2">
                  
                  {/* Address label */}
                  <div className="sm:col-span-12 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Address Label</label>
                    <div className="flex gap-2">
                      {['home', 'work', 'other'].map((lbl) => (
                        <label key={lbl} className="flex items-center gap-1.5 text-xs text-charcoal cursor-pointer">
                          <input
                            type="radio"
                            value={lbl}
                            {...register('label')}
                            className="text-primary focus:ring-primary focus:ring-offset-0"
                          />
                          <span className="capitalize">{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-6 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Receiver Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...register('fullName')}
                      className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    {errors.fullName && <span className="text-[10px] text-destructive">{errors.fullName.message as string}</span>}
                  </div>

                  <div className="sm:col-span-6 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      {...register('phone')}
                      className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    {errors.phone && <span className="text-[10px] text-destructive">{errors.phone.message as string}</span>}
                  </div>

                  <div className="sm:col-span-12 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Address Line 1</label>
                    <input
                      type="text"
                      placeholder="Flat/House No., Building Name, Street..."
                      {...register('line1')}
                      className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    {errors.line1 && <span className="text-[10px] text-destructive">{errors.line1.message as string}</span>}
                  </div>

                  <div className="sm:col-span-12 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="Landmark, Area, Sector..."
                      {...register('line2')}
                      className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div className="sm:col-span-4 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">City</label>
                    <input
                      type="text"
                      placeholder="Harda"
                      {...register('city')}
                      className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    {errors.city && <span className="text-[10px] text-destructive">{errors.city.message as string}</span>}
                  </div>

                  <div className="sm:col-span-4 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">State</label>
                    <input
                      type="text"
                      placeholder="Madhya Pradesh"
                      {...register('state')}
                      className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    {errors.state && <span className="text-[10px] text-destructive">{errors.state.message as string}</span>}
                  </div>

                  <div className="sm:col-span-4 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">PIN Code</label>
                    <input
                      type="text"
                      placeholder="461331"
                      {...register('pincode')}
                      className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    {errors.pincode && <span className="text-[10px] text-destructive">{errors.pincode.message as string}</span>}
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-12 flex justify-between items-center mt-4">
                    {isLoggedIn && user?.addresses && user.addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 outline-none hover:underline"
                      >
                        <ArrowLeft size={12} /> Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!isLoggedIn && (!guestEmail || !guestPhone)}
                      className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 ml-auto px-8 outline-none disabled:opacity-50"
                    >
                      Use Address <ArrowRight size={14} />
                    </button>
                  </div>

                </form>
              )}

            </div>
          )}

          {/* Step 2: SHIPPING */}
          {step === 'shipping' && (
            <div className="flex flex-col gap-6">
              <h2 className="font-display font-bold text-xl text-charcoal flex items-center gap-2">
                <Truck size={20} className="text-primary" /> Delivery Method
              </h2>

              <div className="border border-primary bg-secondary/5 p-4 rounded-xl flex items-center justify-between font-sans">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-charcoal">Standard Doorstep Delivery</h3>
                    <p className="text-[10px] text-muted-foreground">Takes 3–5 business days to reach anywhere in India</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">
                  {subtotal >= 499 ? "FREE" : "₹40"}
                </span>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep('address')}
                  className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 outline-none hover:underline"
                >
                  <ArrowLeft size={12} /> Back
                </button>
                <button
                  onClick={() => setStep('payment')}
                  className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 px-8 outline-none"
                >
                  Proceed to Payment <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: PAYMENT */}
          {step === 'payment' && (
            <div className="flex flex-col gap-6">
              <h2 className="font-display font-bold text-xl text-charcoal flex items-center gap-2">
                <CreditCard size={20} className="text-primary" /> Payment Method
              </h2>

              <div className="flex flex-col gap-4 font-sans text-xs">
                
                {/* Razorpay Option */}
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={cn(
                    "p-4 rounded-xl border text-left flex items-center justify-between outline-none transition-colors",
                    paymentMethod === 'razorpay' ? "border-primary bg-secondary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <div>
                    <h3 className="font-bold text-xs text-charcoal">Pay with UPI / Cards / Net Banking</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Secure payment processing via Razorpay</p>
                  </div>
                  <input
                    type="radio"
                    checked={paymentMethod === 'razorpay'}
                    readOnly
                    className="text-primary focus:ring-0"
                  />
                </button>

                {/* COD Option */}
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={cn(
                    "p-4 rounded-xl border text-left flex items-center justify-between outline-none transition-colors",
                    paymentMethod === 'cod' ? "border-primary bg-secondary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <div>
                    <h3 className="font-bold text-xs text-charcoal">Cash on Delivery (COD)</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Pay in cash on delivery (+₹20 COD Charge applies)</p>
                  </div>
                  <input
                    type="radio"
                    checked={paymentMethod === 'cod'}
                    readOnly
                    className="text-primary focus:ring-0"
                  />
                </button>

              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep('shipping')}
                  className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 outline-none hover:underline"
                >
                  <ArrowLeft size={12} /> Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 px-8 outline-none"
                >
                  Review Order <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: REVIEW & PLACE */}
          {step === 'review' && (
            <div className="flex flex-col gap-6">
              <h2 className="font-display font-bold text-xl text-charcoal flex items-center gap-2">
                <CheckCircle2 size={20} className="text-primary" /> Review Order Details
              </h2>

              <div className="flex flex-col gap-4 divide-y divide-border-spice/40 text-xs font-sans text-charcoal">
                
                {/* Shipping Details */}
                <div className="pb-4">
                  <h3 className="font-bold text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">Shipping Destination</h3>
                  <div className="flex flex-col">
                    <strong className="text-sm font-semibold">{tempAddress.fullName}</strong>
                    <span>{tempAddress.line1}, {tempAddress.line2}</span>
                    <span>{tempAddress.city}, {tempAddress.state} - {tempAddress.pincode}</span>
                    <span className="font-medium mt-1">📞 {tempAddress.phone}</span>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="py-4">
                  <h3 className="font-bold text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">Payment Method</h3>
                  <span className="capitalize font-semibold">{paymentMethod === 'razorpay' ? "UPI / Card Online Payment" : "Cash on Delivery (COD)"}</span>
                </div>

                {/* Security Idempotency note */}
                <div className="py-4 flex gap-2.5 items-start bg-cream/35 p-3.5 rounded-xl border border-border-spice/30">
                  <Info className="text-primary shrink-0" size={16} />
                  <span className="text-[10px] text-muted-foreground leading-normal">
                    This order is protected with transaction safety guards. Double-clicking or connection retries will not result in duplicate charges.
                  </span>
                </div>

              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep('payment')}
                  className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 outline-none hover:underline"
                >
                  <ArrowLeft size={12} /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={submittingOrder}
                  className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center gap-2 px-12 outline-none disabled:opacity-50"
                >
                  {submittingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                  Place Order (₹{total.toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Summary screen columns */}
        <div className="lg:col-span-4 bg-cream/20 p-6 rounded-2xl border border-border-spice/50 flex flex-col gap-6 font-sans text-xs">
          <h2 className="font-display font-bold text-lg text-charcoal flex items-center gap-2 shrink-0">
            <ShoppingBag size={18} className="text-primary" /> Summary
          </h2>

          {/* List items */}
          <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[220px] pr-1 border-b border-border-spice pb-6">
            {items.map((item) => {
              const variant = item.product?.weights?.find(w => w.weight === item.weight);
              const itemPrice = variant ? variant.price : 0;

              return (
                <div key={`${item.product?._id}-${item.weight}`} className="flex justify-between items-start gap-4">
                  <div className="flex flex-col">
                    <strong className="text-xs text-charcoal font-bold">{item.product?.name}</strong>
                    <span className="text-[10px] text-muted-foreground font-semibold">{item.weight} × {item.qty}</span>
                  </div>
                  <span className="text-xs font-bold text-charcoal">₹{(itemPrice * item.qty).toLocaleString('en-IN')}</span>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Items Total</span>
              <span className="font-semibold text-charcoal">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {coupon && (
              <div className="flex items-center justify-between text-green-600 font-medium">
                <span>Discount ({coupon.code})</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Shipping Fee</span>
              <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>COD Charge</span>
                <span>₹20</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-bold text-charcoal border-t border-border-spice/40 pt-4 mt-1">
              <span>Order Total</span>
              <span className="text-primary text-base">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

