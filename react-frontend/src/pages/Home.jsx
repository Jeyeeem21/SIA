import { Link } from 'react-router-dom';
import { 
  Printer, 
  CreditCard, 
  ShoppingBag, 
  FileText, 
  Clock,
  CheckCircle,
  ArrowRight,
  Package,
  Users,
  TrendingUp
} from 'lucide-react';

const Home = () => {
  const services = [
    {
      icon: Printer,
      title: 'Printing Services',
      description: 'Fast and affordable photocopying and printing',
      color: 'from-cyan-500 to-teal-600'
    },
    {
      icon: CreditCard,
      title: 'ID Creation',
      description: 'Professional ID card printing and lamination',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: ShoppingBag,
      title: 'Uniform & Fabric Sales',
      description: 'Quality tela and uniform materials',
      color: 'from-rose-500 to-red-600'
    },
    {
      icon: FileText,
      title: 'Document Services',
      description: 'Binding, lamination, and document processing',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const features = [
    { icon: Clock, text: 'Quick Processing' },
    { icon: CheckCircle, text: 'Quality Assured' },
    { icon: Package, text: 'Track Your Orders' },
    { icon: Users, text: 'Student-Friendly' }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-teal-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-8 py-16">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                Mindoro State University – Bongabong Campus
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent">
              Welcome to MinSU Business Center
            </h1>
            <p className="text-2xl text-slate-600 mb-4 font-medium">
              Your one-stop solution for printing, ID, and uniform services.
            </p>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              The MinSU Business Center provides fast, reliable, and affordable services for students and faculty. 
              From photocopying to fabric sales, our system makes it easier to order, track, and receive updates 
              on your requests — all in one platform.
            </p>
            
            <div className="flex gap-4 justify-center mb-12">
              <Link
                to="/dashboard"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold shadow-lg border-2 border-slate-200 hover:border-cyan-600 hover:text-cyan-600 transition-all hover:scale-105 active:scale-95"
              >
                View Services
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-slate-200">
                  <feature.icon className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-semibold text-slate-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Services</h2>
          <p className="text-lg text-slate-600">Comprehensive business solutions for the MinSU community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${service.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-cyan-100">Students Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-cyan-100">Services Offered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-cyan-100">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-cyan-100">Order Tracking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-slate-400">
            © 2025 Mindoro State University – Bongabong Campus | Business Center System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
