'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carPlate: string;
  carMake: string;
  carModel: string;
  carColor: string;
  carMileage: string;
  reasonForVisit: string;
  routineService: boolean;
}

export default function CarIntakePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('receptionist');
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    carPlate: '',
    carMake: '',
    carModel: '',
    carColor: '',
    carMileage: '',
    reasonForVisit: '',
    routineService: false,
  });

  const fillDummyData = () => {
    const firstNames = ['Alex', 'Ama', 'Kojo', 'Fatima', 'Kofi', 'Esi'];
    const lastNames = ['Mensah', 'Boateng', 'Owusu', 'Abiola', 'Tetteh', 'Asare'];
    const makes = ['Toyota', 'Honda', 'Hyundai', 'Nissan', 'Kia', 'Ford'];
    const models = ['Corolla', 'Civic', 'Elantra', 'Altima', 'Sportage', 'Focus'];
    const colors = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Yellow'];
    const reasons = [
      'Routine service and brake inspection.',
      'Engine noise diagnosis.',
      'Oil change and tire rotation.',
      'Battery replacement and diagnostics.',
      'A/C not cooling properly.',
    ];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const make = makes[Math.floor(Math.random() * makes.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const mileage = String(20000 + Math.floor(Math.random() * 120000));
    const phone = `02${Math.floor(10000000 + Math.random() * 90000000)}`;
    const plate = `GR-${Math.floor(1000 + Math.random() * 9000)}-${String(new Date().getFullYear()).slice(-2)}`;

    setFormData({
      customerName: `${firstName} ${lastName}`,
      customerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      customerPhone: phone,
      carPlate: plate,
      carMake: make,
      carModel: model,
      carColor: color,
      carMileage: mileage,
      reasonForVisit: reasons[Math.floor(Math.random() * reasons.length)],
      routineService: Math.random() > 0.5,
    });
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || 'receptionist');
      } catch (e) {
        setUserRole('receptionist');
      }
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, create or get the customer
      let customer = await api.customers.create({
        name: formData.customerName,
        email: formData.customerEmail,
        phone_number: formData.customerPhone,
      }).catch((err) => {
        // If customer exists, try to get it by email
        console.error('Customer creation error:', err);
        return api.customers.list(formData.customerEmail).then(data => {
          if (data.results && data.results.length > 0) {
            return data.results[0];
          }
          throw new Error('Could not create or find customer');
        });
      });

      // Then, create the car
      const car = await api.cars.create({
        customer: customer.id,
        number_plate: formData.carPlate,
        make: formData.carMake,
        model: formData.carModel,
        color: formData.carColor,
        mileage: parseInt(formData.carMileage),
        reason_for_visit: formData.reasonForVisit,
        is_routine_service: formData.routineService,
        status: 'awaiting_diagnostics',
      });

      // Redirect to car details
      router.push(`/cars/${car.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create car entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-4">
        <div className="dashboard-section p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Information */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
                    placeholder="Enter email"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Car Information */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Car Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="carPlate" className="block text-sm font-medium text-gray-700 mb-2">
                    Number Plate
                  </label>
                  <input
                    id="carPlate"
                    name="carPlate"
                    type="text"
                    value={formData.carPlate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
                    placeholder="e.g., ABC123"
                  />
                </div>

                <div>
                  <label htmlFor="carMake" className="block text-sm font-medium text-gray-700 mb-2">
                    Make
                  </label>
                  <input
                    id="carMake"
                    name="carMake"
                    type="text"
                    value={formData.carMake}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
                    placeholder="e.g., Toyota"
                  />
                </div>

                <div>
                  <label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    id="carModel"
                    name="carModel"
                    type="text"
                    value={formData.carModel}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
                    placeholder="e.g., Camry"
                  />
                </div>

                <div>
                  <label htmlFor="carColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    id="carColor"
                    name="carColor"
                    type="text"
                    value={formData.carColor}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
                    placeholder="e.g., Red"
                  />
                </div>

                <div>
                  <label htmlFor="carMileage" className="block text-sm font-medium text-gray-700 mb-2">
                    Mileage (km)
                  </label>
                  <input
                    id="carMileage"
                    name="carMileage"
                    type="number"
                    value={formData.carMileage}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
                    placeholder="Enter mileage"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="reasonForVisit" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <textarea
                    id="reasonForVisit"
                    name="reasonForVisit"
                    value={formData.reasonForVisit}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
                    placeholder="Describe the reason for visit"
                  />
                </div>

                <div className="md:col-span-2 flex items-center">
                  <input
                    id="routineService"
                    name="routineService"
                    type="checkbox"
                    checked={formData.routineService}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-700 border-gray-300 rounded focus:ring-primary-700"
                  />
                  <label htmlFor="routineService" className="ml-2 text-sm text-gray-700">
                    This is a routine service
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="button"
                onClick={fillDummyData}
                className="flex-1 border border-primary-300 hover:bg-primary-50 text-primary-800 font-medium py-2 rounded-lg transition"
              >
                Fill dummy data
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 font-medium py-2 rounded-lg transition"
              >
                {loading ? 'Creating Car Folder...' : 'Create Car Folder'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border border-primary-300 hover:bg-primary-50 text-primary-800 font-medium py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

