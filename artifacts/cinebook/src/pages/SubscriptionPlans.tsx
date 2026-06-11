import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhonePePayment from "@/components/PhonePePayment";
import { SUBSCRIPTION_PLANS, subscribe, addPayment, getSubscription } from "@/lib/subscriptionData";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function SubscriptionPlans() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<typeof SUBSCRIPTION_PLANS[0] | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const currentSub = getSubscription();
  const isActiveSub = currentSub?.status === "active";

  const handlePlanSelect = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    if (isActiveSub && currentSub?.planId === plan.id) {
      toast({
        title: "Already Subscribed",
        description: `You are already subscribed to the ${plan.name} plan.`,
        variant: "destructive",
      });
      return;
    }
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (method: "upi" | "card" | "wallet" | "netbanking") => {
    if (!selectedPlan) return;

    const price = billingCycle === "monthly" ? selectedPlan.price : selectedPlan.annualPrice;
    
    // Subscribe in data store
    subscribe(selectedPlan.id, billingCycle);

    // Record payment
    addPayment({
      type: "subscription",
      amount: price,
      currency: "INR",
      status: "success",
      method,
      transactionId: `TXN_SUB_${Date.now()}`,
      description: `${selectedPlan.name} Subscription - ${billingCycle === "monthly" ? "Monthly" : "Annual"}`,
      planId: selectedPlan.id,
    });

    toast({
      title: "Subscription Activated!",
      description: `Welcome to Movi Kova Premium. You now have access to ${selectedPlan.name} plan.`,
    });

    setShowPayment(false);
    setSelectedPlan(null);
    
    // Redirect to profile to see details
    setTimeout(() => {
      setLocation("/profile");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f84464]/10 border border-[#f84464]/20 text-[#f84464] text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Zap className="w-3.5 h-3.5 fill-[#f84464]" /> Movi Kova VIP Pass
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
          >
            Choose the Plan that fits your Vibe
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-base"
          >
            Unlock unlimited movie streaming, premium theater booking benefits, early access to new releases, and much more.
          </motion.p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center items-center gap-3 mb-12">
          <span className={`text-sm ${billingCycle === "monthly" ? "text-white font-bold" : "text-gray-400"}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(c => c === "monthly" ? "annual" : "monthly")}
            className="relative w-14 h-7 bg-white/10 rounded-full border border-white/5 p-1 flex items-center transition-colors focus:outline-none"
          >
            <div className={`w-5 h-5 bg-[#f84464] rounded-full transition-transform transform ${billingCycle === "annual" ? "translate-x-7" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm flex items-center gap-1.5 ${billingCycle === "annual" ? "text-white font-bold" : "text-gray-400"}`}>
            Yearly 
            <span className="text-[10px] bg-green-500/15 border border-green-500/30 text-green-400 px-2 py-0.5 rounded font-extrabold tracking-wide">SAVE ~20%</span>
          </span>
        </div>

        {/* Current status display */}
        {isActiveSub && currentSub && (
          <div className="max-w-md mx-auto mb-10 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">
              You are currently on the <span className="text-[#f84464] font-bold uppercase">{currentSub.planId}</span> plan.
            </p>
            <button 
              onClick={() => setLocation("/profile")}
              className="text-[#f84464] hover:underline text-xs mt-1 inline-flex items-center gap-1"
            >
              Manage current subscription <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const isRec = plan.recommended;
            const price = billingCycle === "monthly" ? plan.price : plan.annualPrice;
            const periodLabel = billingCycle === "monthly" ? "/mo" : "/yr";
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 md:p-8 transition-all duration-300 ${
                  isRec 
                    ? "bg-[#0e0e1a] border-[#f84464] shadow-lg shadow-[#f84464]/10 md:-translate-y-4" 
                    : "bg-[#0b0b0f] border-white/5 hover:border-white/10"
                }`}
              >
                {isRec && (
                  <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#f84464] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mb-6 font-medium">Quality: {plan.quality}</p>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl md:text-5xl font-black font-display text-white">₹{price}</span>
                    <span className="text-gray-400 text-sm">{periodLabel}</span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/5 w-full mb-6" />

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-[#f84464] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all ${
                    isRec 
                      ? "bg-[#f84464] hover:bg-[#f84464]/90 text-white shadow-lg shadow-[#f84464]/20" 
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                  }`}
                >
                  Get Started
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-12 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-green-500" /> Secure payment integration via PhonePe
        </div>
      </main>

      <Footer />

      {/* PhonePe Modal */}
      {showPayment && selectedPlan && (
        <PhonePePayment
          amount={billingCycle === "monthly" ? selectedPlan.price : selectedPlan.annualPrice}
          description={`${selectedPlan.name} Plan - ${billingCycle === "monthly" ? "Monthly" : "Annual"}`}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPayment(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
}
