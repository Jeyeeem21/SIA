import { useState } from 'react';
import { User, Lock, Bell, Database, Mail, Palette, Globe, Shield, Save } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'backup', label: 'Backup & Data', icon: Database },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
          System Settings
        </h1>
        <p className="text-slate-600 mt-1">Manage your account and system preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 bg-white rounded-xl shadow-md p-4 h-fit">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Information</h2>
                <p className="text-slate-600">Update your personal information and profile details</p>
              </div>

              <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  JD
                </div>
                <div>
                  <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                    Change Photo
                  </button>
                  <p className="text-sm text-slate-500 mt-2">JPG, GIF or PNG. Max size of 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue="john.doe@minsu.edu.ph"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="0912-345-6789"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <input
                    type="text"
                    defaultValue="Administrator"
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500"
                  />
                </div>
              </div>

              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Security Settings</h2>
                <p className="text-slate-600">Manage your password and security preferences</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">Password Requirements</h3>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include at least one number</li>
                      <li>• Include at least one special character</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
                <Lock className="w-5 h-5" />
                Update Password
              </button>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Notification Preferences</h2>
                <p className="text-slate-600">Choose what notifications you want to receive</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Receive email updates about orders and activities' },
                  { label: 'Order Updates', desc: 'Get notified when order status changes' },
                  { label: 'Low Stock Alerts', desc: 'Receive alerts when inventory is running low' },
                  { label: 'New Customer Registration', desc: 'Get notified when new customers register' },
                  { label: 'System Updates', desc: 'Receive notifications about system maintenance' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">{item.label}</h3>
                      <p className="text-sm text-slate-600 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-600 peer-checked:to-teal-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
                <Save className="w-5 h-5" />
                Save Preferences
              </button>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Appearance Settings</h2>
                <p className="text-slate-600">Customize the look and feel of your dashboard</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Color Theme</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Cyan', from: 'from-cyan-600', to: 'to-teal-600' },
                    { name: 'Blue', from: 'from-blue-600', to: 'to-indigo-600' },
                    { name: 'Purple', from: 'from-purple-600', to: 'to-pink-600' },
                    { name: 'Green', from: 'from-emerald-600', to: 'to-green-600' },
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      className={`p-4 rounded-xl bg-gradient-to-br ${theme.from} ${theme.to} text-white font-medium hover:scale-105 transition-transform shadow-lg`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Language</label>
                <select className="w-full md:w-64 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                  <option>English</option>
                  <option>Filipino</option>
                </select>
              </div>

              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
                <Palette className="w-5 h-5" />
                Apply Theme
              </button>
            </div>
          )}

          {/* Backup & Data Settings */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Backup & Data Management</h2>
                <p className="text-slate-600">Manage your data backups and exports</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl">
                  <Database className="w-12 h-12 text-cyan-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">Database Backup</h3>
                  <p className="text-sm text-slate-600 mb-4">Create a full backup of your database</p>
                  <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                    Create Backup
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                  <Mail className="w-12 h-12 text-emerald-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">Export Data</h3>
                  <p className="text-sm text-slate-600 mb-4">Export your data in CSV or Excel format</p>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    Export Now
                  </button>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-4">Backup History</h3>
                <div className="space-y-3">
                  {[
                    { date: '2025-10-29 14:30', size: '2.3 MB', status: 'Success' },
                    { date: '2025-10-22 14:30', size: '2.1 MB', status: 'Success' },
                    { date: '2025-10-15 14:30', size: '1.9 MB', status: 'Success' },
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">{backup.date}</p>
                        <p className="text-sm text-slate-600">{backup.size}</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        {backup.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
