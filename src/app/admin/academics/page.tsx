'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiBook, FiUsers, FiTrendingUp, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/dateUtils';

export default function AcademicsPage() {
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [customAcademicYear, setCustomAcademicYear] = useState('');
  const [showCustomYear, setShowCustomYear] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [academicTerms, setAcademicTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAcademicTerms();
      } catch (error) {
        console.error('Failed to load academics page:', error);
        // Prevent crash by ensuring state is set
        setAcademicTerms([]);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchAcademicTerms = async () => {
    try {
      setLoading(true);
      const response = await api.results.academicTerms.list();
      setAcademicTerms(response.results || response || []);
    } catch (error: any) {
      console.error('Error fetching academic terms:', error);
      // Don't let errors crash the page
      setAcademicTerms([]);
      if (error?.response?.status !== 401) {
        // Only show error if not authentication related
        alert('Failed to load academic terms. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    {
      key: 'academic_year',
      header: 'Academic Year',
      render: (term: any) => {
        if (!term || !term.academic_year || !term.term) return 'N/A';
        const termName = term.term === 1 ? 'First' : term.term === 2 ? 'Second' : term.term === 3 ? 'Third' : 'Unknown';
        return `${term.academic_year} - Term ${term.term} (${termName})`;
      }
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (term: any) => {
        if (!term || !term.start_date) return 'Not set';
        try {
          return formatDate(term.start_date);
        } catch (e) {
          return 'Invalid date';
        }
      }
    },
    {
      key: 'end_date',
      header: 'End Date',
      render: (term: any) => {
        if (!term || !term.end_date) return 'Not set';
        try {
          return formatDate(term.end_date);
        } catch (e) {
          return 'Invalid date';
        }
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (term: any) => {
        if (!term || !term.status) return <StatusBadge status="unknown" />;
        return <StatusBadge status={term.status} />;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (term: any) => (
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 border ${term.status === 'ongoing' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
          >
            <FiCheckCircle className="w-4 h-4" />
            {term.status === 'ongoing' ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
  ];

  return (
    <div className="">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Active Terms"
          value={academicTerms.filter((t: any) => t.status === 'ongoing').length.toString()}
          icon={<FiBook className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Terms"
          value={academicTerms.length.toString()}
          icon={<FiBook className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Completed Terms"
          value={academicTerms.filter((t: any) => t.status === 'completed').length.toString()}
          icon={<FiBook className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Upcoming Terms"
          value={academicTerms.filter((t: any) => t.status === 'not_started').length.toString()}
          icon={<FiBook className="w-6 h-6" />}
          color="primary"
        />
      </div>

      {/* Academics Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Academic Terms</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search terms..."
              className="input-field w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading academic terms...</div>
        ) : (
          <DataTable columns={columns} data={academicTerms} />
        )}
      </div>
    </div>
  );
}

