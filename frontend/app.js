import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Download, Settings, Home, FileText, User, Search, Bell, MessageCircle, MoreHorizontal, Edit, Eye } from 'lucide-react';

// Mock API functions (replace with actual API calls)
const api = {
  async login(username, password) {
    // Replace with actual API call
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await fetch('/users/login', {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  
  async register(userData) {
    const response = await fetch('/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  async getInvoices(token) {
    const response = await fetch('/invoices/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async createInvoice(invoiceData, token) {
    const response = await fetch('/invoices/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(invoiceData)
    });
    return response.json();
  },

  async getProfile(token) {
    const response = await fetch('/profiles/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async updateProfile(profileData, token) {
    const response = await fetch('/profiles/', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    return response.json();
  },

  async getAccounts(token) {
    const response = await fetch('/accounts/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async createAccount(accountData, token) {
    const response = await fetch('/accounts/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(accountData)
    });
    return response.json();
  }
};

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Decode token or fetch user info
      setUser({ username: 'Mike', id: 1 });
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      setToken(response.access_token);
      localStorage.setItem('token', response.access_token);
      setUser({ username });
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return React.useContext(AuthContext);
}

// Login Component
function LoginForm({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(formData.username, formData.password);
    } catch (error) {
      alert('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center mb-8">
            <div className="bg-green-500 text-white p-2 rounded-lg mr-2">⚡</div>
            <h1 className="text-3xl font-bold">QuickBill</h1>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-green-500 hover:text-green-600"
            >
              Don't have an account? Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Register Component
function RegisterForm({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.register(formData);
      alert('Registration successful! Please login.');
      onSwitchToLogin();
    } catch (error) {
      alert('Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center mb-8">
            <div className="bg-green-500 text-white p-2 rounded-lg mr-2">⚡</div>
            <h1 className="text-3xl font-bold">QuickBill</h1>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-green-500 hover:text-green-600"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ currentPage, setCurrentPage }) {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="bg-green-500 text-white p-2 rounded-lg mr-3">⚡</div>
          <h1 className="text-xl font-bold">QuickBill</h1>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${
                currentPage === item.id
                  ? 'bg-green-50 text-green-600 border-r-2 border-green-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        {currentPage === 'invoices' && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 mb-2">
              Create Invoice
            </button>
            <button className="w-full text-gray-600 py-2 px-4 hover:bg-white rounded-lg">
              View Invoice
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="border-t pt-4 space-y-2">
          <button className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <MessageCircle className="w-5 h-5 mr-3" />
            My Advisor
          </button>
          <button className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <User className="w-5 h-5 mr-3" />
            Help Center
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Header Component
function Header({ user }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              12
            </span>
          </button>
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <Bell className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div>
              <div className="text-sm font-medium">{user?.username || 'Mike'}</div>
              <div className="text-xs text-gray-500">732 829 320 00074</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const invoices = [
    { id: 'INV135874830', date: 'Sep 01, 2022', amount: '$1,800' },
    { id: 'INV135790468', date: 'Aug 30, 2022', amount: '$2,800' },
    { id: 'INV352583010', date: 'Aug 29, 2022', amount: '$800' },
    { id: 'INV298364902', date: 'Aug 29, 2022', amount: '$700' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">MY INVOICES</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">New Invoice</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700 border-b pb-2">
                <div>Invoice Name</div>
                <div>Date</div>
                <div>Amount</div>
              </div>
              
              {invoices.map((invoice) => (
                <div key={invoice.id} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div className="text-sm font-medium">{invoice.id}</div>
                  <div className="text-sm text-gray-600">{invoice.date}</div>
                  <div className="text-sm font-medium">{invoice.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 mb-6">
            Create New Invoice
          </button>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Invoices Created</span>
                <span className="text-sm font-medium">15</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Paid</span>
                <span className="text-sm font-medium text-green-600">10</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unpaid</span>
                <span className="text-sm font-medium text-red-600">5</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="text-sm font-medium">$3,250.00</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month's Earnings</span>
                <span className="text-sm font-medium">$950.00</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Outstanding Payments</span>
                <span className="text-sm font-medium text-orange-600">$275.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Invoice Component
function CreateInvoice({ onBack }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    due_date: '',
    billing_address: '',
    extra_information: '',
    items: [{ title: '', quantity: 1, unit_price: 0 }]
  });
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    loadProfile();
    loadAccounts();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await api.getProfile(token);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile');
    }
  };

  const loadAccounts = async () => {
    try {
      const accountsData = await api.getAccounts(token);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load accounts');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { title: '', quantity: 1, unit_price: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = (item) => {
    return item.quantity * item.unit_price;
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + calculateSubtotal(item), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createInvoice(formData, token);
      alert('Invoice created successfully!');
      onBack();
    } catch (error) {
      alert('Failed to create invoice');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 text-gray-600 hover:text-gray-900">
          ← Back
        </button>
        <h2 className="text-2xl font-bold">CREATE INVOICE</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">COMPANY INFORMATION</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Company Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={profile?.business_name || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Email</label>
              <input
                type="email"
                placeholder="Company Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Billing Address</label>
              <textarea
                placeholder="Billing Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.billing_address}
                onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">PAYMENT INFORMATION</h3>
            <button type="button" className="text-green-500 hover:text-green-600">
              Use Profile Information
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.length > 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={accounts[0]?.account_number || ''}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bank</label>
                  <input
                    type="text"
                    placeholder="Bank"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={accounts[0]?.bank_name || ''}
                    readOnly
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Client Name</label>
              <input
                type="text"
                placeholder="Client Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">ITEM DETAILS</h3>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Item {index + 1}</label>
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price</label>
                  <input
                    type="number"
                    placeholder="Unit Price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtotal</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-lg font-semibold">
                    ${calculateSubtotal(item).toFixed(2)}
                  </div>
                </div>
                <div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <button
              type="button"
              onClick={addItem}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
            >
              Add New Item
            </button>
            <div className="text-xl font-bold">
              Total: ${calculateTotal().toFixed(2)}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Extra Information</label>
          <textarea
            placeholder="Additional notes or information"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.extra_information}
            onChange={(e) => setFormData({ ...formData, extra_information: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-green-500 text-white py-3 px-8 rounded-lg hover:bg-green-600 text-lg font-semibold"
          >
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  );
}

// Settings Component
function Settings() {
  const { token } = useAuth();
  const [profile, setProfile] = useState({
    firstname: '',
    lastname: '',
    business_name: '',
    address: ''
  });
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    paypal_ID: ''
  });
  const [showAddAccount, setShowAddAccount] = useState(false);

  useEffect(() => {
    loadProfile();
    loadAccounts();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await api.getProfile(token);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile');
    }
  };

  const loadAccounts = async () => {
    try {
      const accountsData = await api.getAccounts(token);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load accounts');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile(profile, token);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleAccountAdd = async (e) => {
    e.preventDefault();
    try {
      await api.createAccount(newAccount, token);
      setNewAccount({ account_name: '', account_number: '', bank_name: '', paypal_ID: '' });
      setShowAddAccount(false);
      loadAccounts();
      alert('Account added successfully!');
    } catch (error) {
      alert('Failed to add account');
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Settings</h2>
        <div className="flex space-x-4">
          <Search className="w-6 h-6 text-gray-400" />
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <Bell className="w-6 h-6 text-gray-400" />
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
          <div>
            <h3 className="text-xl font-semibold">Alexa Rawles</h3>
            <p className="text-gray-600">alexarawles@gmail.com</p>
          </div>
          <button className="ml-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            Save
          </button>
        </div>

        <form onSubmit={handleProfileUpdate}>
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">PERSONAL INFORMATION</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="Your First Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={profile.firstname}
                  onChange={(e) => setProfile({ ...profile, firstname: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Your Last Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={profile.lastname}
                  onChange={(e) => setProfile({ ...profile, lastname: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  placeholder="Your Username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Business Name (optional)</label>
                <input
                  type="text"
                  placeholder="Your Business Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={profile.business_name}
                  onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  placeholder="Address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">PAYMENT INFORMATION</h4>
              <button
                type="button"
                onClick={() => setShowAddAccount(!showAddAccount)}
                className="text-green-500 hover:text-green-600"
              >
                + Add Account
              </button>
            </div>

            {showAddAccount && (
              <form onSubmit={handleAccountAdd} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Name</label>
                    <input
                      type="text"
                      placeholder="Account Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newAccount.account_name}
                      onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <input
                      type="text"
                      placeholder="Account Number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newAccount.account_number}
                      onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bank</label>
                    <input
                      type="text"
                      placeholder="Bank"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newAccount.bank_name}
                      onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">PayPal (optional)</label>
                    <input
                      type="text"
                      placeholder="PayPal ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newAccount.paypal_ID}
                      onChange={(e) => setNewAccount({ ...newAccount, paypal_ID: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAccount(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Add Account
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accounts.map((account, index) => (
                <div key={account.id} className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium mb-2">{account.account_name}</h5>
                  <p className="text-sm text-gray-600">Account: {account.account_number}</p>
                  <p className="text-sm text-gray-600">Bank: {account.bank_name}</p>
                  {account.paypal_ID && (
                    <p className="text-sm text-gray-600">PayPal: {account.paypal_ID}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name (optional)</label>
                <input
                  type="text"
                  placeholder="Your Business Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Invoice Details Component
function InvoiceDetails({ invoice, onBack, onDelete, onStatusUpdate }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/invoices/${invoice.id}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoice.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download invoice');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusUpdate(invoice.id, newStatus);
    } catch (error) {
      alert('Failed to update invoice status');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 text-gray-600 hover:text-gray-900">
            ← Invoice Details
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <span>More Options</span>
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden">
              <button
                onClick={() => onDelete(invoice.id)}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Delete Invoice
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">
                Edit Invoice
              </button>
            </div>
          </div>
          <button
            onClick={() => handleStatusChange('paid')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Mark as paid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Invoice #{invoice.id}</h2>
                  <p className="text-gray-600">Created on {formatDate(invoice.created_at)}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">#{invoice.id}</div>
                  <div className="flex items-center mt-2">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      invoice.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></span>
                    <span className={`text-sm font-medium ${
                      invoice.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {invoice.status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-orange-100 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-12 h-12 bg-orange-500 rounded mr-3"></div>
                    <div>
                      <h3 className="font-semibold">Sisyphus</h3>
                      <p className="text-sm text-gray-600">John Brandon</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    78911 Sector-2c, 38200 Gandhinagar, France<br />
                    848172194 | contact@beta6.se<br />
                    SIRET: 362 521 879 00034<br />
                    VAT: 842-484021
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Billing Address</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Willy Wonka</strong></p>
                    <p>1445 West Norwood Avenue, Itasca, Illinois, USA</p>
                    <p>9722041054 | om@om.com</p>
                    <p>SIRET: 362 521 879 00034</p>
                    <p>VAT: 842-484021</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Bill Date:</span> {formatDate(invoice.created_at)}</div>
                    <div><span className="font-medium">Delivery Date:</span> {formatDate(invoice.due_date)}</div>
                    <div><span className="font-medium">Terms of Payment:</span> Within 15 days</div>
                    <div><span className="font-medium">Payment Deadline:</span> {formatDate(invoice.due_date)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Note</h4>
                  <p className="text-sm text-gray-600">
                    {invoice.extra_information || "This is a custom message that might be relevant to the customer. It can span up to three or four rows. It can span up to three or four rows."}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium">NO.</th>
                      <th className="text-left py-2 text-sm font-medium">ARTICLE</th>
                      <th className="text-left py-2 text-sm font-medium">QUANTITY</th>
                      <th className="text-left py-2 text-sm font-medium">UNIT PRICE</th>
                      <th className="text-left py-2 text-sm font-medium">VAT</th>
                      <th className="text-left py-2 text-sm font-medium">AMOUNT</th>
                      <th className="text-left py-2 text-sm font-medium">FINAL AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 text-sm">{index + 1}</td>
                        <td className="py-3">
                          <div className="text-sm font-medium">{item.title}</div>
                          <div className="text-xs text-gray-500">Product Description</div>
                        </td>
                        <td className="py-3 text-sm">{item.quantity} Unit(s)</td>
                        <td className="py-3 text-sm">€{item.unit_price}</td>
                        <td className="py-3 text-sm">0%</td>
                        <td className="py-3 text-sm">€{item.subtotal}</td>
                        <td className="py-3 text-sm">€{item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total HT</span>
                    <span>€{invoice.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Disbursements</span>
                    <span>€30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total VAT</span>
                    <span>€0</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Price</span>
                    <span>€{invoice.total}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200">
                <h4 className="font-medium mb-2">Terms & Conditions</h4>
                <p className="text-sm text-gray-600">Please pay within 15 days of receiving this invoice.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-block w-3 h-3 rounded-full ${
                invoice.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'
              }`}></span>
              <span className={`text-sm font-medium ${
                invoice.status === 'paid' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {invoice.status === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            
            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-medium">€{invoice.total} Incl. VAT</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium">Deposit No. 2020-04-0006</span>
                </div>
                <div className="text-xs text-gray-500 ml-4">
                  <div>Date: Oct 24, 2019</div>
                  <div>Amount: €300</div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium">Partial Payment</span>
                </div>
                <div className="text-xs text-gray-500 ml-4">
                  <div>Date: Oct 26, 2019</div>
                  <div>Amount: €400</div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium">Partial Payment</span>
                </div>
                <div className="text-xs text-gray-500 ml-4">
                  <div>Date: Oct 27, 2019</div>
                  <div>Amount: €2,230</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Remaining Amount</span>
                  <span className="font-medium">€100 Incl. VAT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const { user, login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, [user]);

  const handleLogin = async (username, password) => {
    await login(username, password);
    setIsAuthenticated(true);
  };

  const handleCreateInvoice = () => {
    setShowCreateInvoice(true);
  };

  const handleBackFromCreate = () => {
    setShowCreateInvoice(false);
    setCurrentPage('dashboard');
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setCurrentPage('invoice-details');
  };

  const handleBackFromDetails = () => {
    setSelectedInvoice(null);
    setCurrentPage('dashboard');
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await fetch(`/invoices/${invoiceId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setCurrentPage('dashboard');
        setSelectedInvoice(null);
      } catch (error) {
        alert('Failed to delete invoice');
      }
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId, status) => {
    try {
      await fetch(`/invoices/${invoiceId}/status?status=${status}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      // Update local state or refetch data
    } catch (error) {
      alert('Failed to update invoice status');
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        {showRegister ? (
          <RegisterForm 
            onRegister={() => {}}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginForm 
            onLogin={handleLogin}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-auto">
          {showCreateInvoice ? (
            <CreateInvoice onBack={handleBackFromCreate} />
          ) : currentPage === 'invoice-details' && selectedInvoice ? (
            <InvoiceDetails 
              invoice={selectedInvoice} 
              onBack={handleBackFromDetails}
              onDelete={handleDeleteInvoice}
              onStatusUpdate={handleUpdateInvoiceStatus}
            />
          ) : currentPage === 'dashboard' ? (
            <Dashboard onCreateInvoice={handleCreateInvoice} onViewInvoice={handleViewInvoice} />
          ) : currentPage === 'settings' ? (
            <Settings />
          ) : (
            <Dashboard />
          )}
        </main>
      </div>
    </div>
  );
}

// Root component with AuthProvider
export default function QuickBillApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}