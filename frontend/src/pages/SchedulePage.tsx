import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

interface ScheduleEntry {
  doctor_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  image_path: string;
  specialty_name: string;
  day_week: string;
  address: string;
}

const SchedulePage = () => {
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/schedule');
        if (!response.ok) {
          throw new Error('Failed to fetch schedule data');
        }
        const data: ScheduleEntry[] = await response.json();
        setScheduleData(data);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };

    fetchScheduleData();
  }, []);

  // Преобразование данных для удобного отображения
  const doctors = scheduleData.reduce((acc: any, item) => {
    const doctorKey = `${item.doctor_id}-${item.first_name}-${item.last_name}`;
    if (!acc[doctorKey]) {
      acc[doctorKey] = {
        id: item.doctor_id,
        name: `${item.first_name} ${item.middle_name} ${item.last_name}`,
        image: item.image_path || 'https://via.placeholder.com/150',
        specialty: item.specialty_name,
        schedule: {} as { [key: string]: string },
      };
    }
    acc[doctorKey].schedule[item.day_week] = item.address;
    return acc;
  }, {});

  const doctorsArray = Object.values(doctors);

  return (
      <div className="w-full bg-white">
        <section className="bg-green-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-800">Расписание врачей</h1>
            <p className="mt-2 text-lg text-gray-600">
              Узнайте, когда и где работают наши специалисты
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Доктор
                  </th>
                  {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'].map(day => (
                      <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {day}
                      </th>
                  ))}
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {doctorsArray.map((doctor: any) => (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            onClick={() => navigate(`/doctors/${doctor.id}`)}
                        >
                          <img src={doctor.image} alt={doctor.name} className="w-10 h-10 rounded-full object-cover" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {doctor.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doctor.specialty}
                            </div>
                          </div>
                        </div>
                      </td>
                      {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'].map(day => (
                          <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctor.schedule[day] && (
                                <div className="flex items-center">
                                  <MapPin size={16} className="text-green-500 mr-2" />
                                  {doctor.schedule[day]}
                                </div>
                            )}
                          </td>
                      ))}
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
  );
};

export default SchedulePage;