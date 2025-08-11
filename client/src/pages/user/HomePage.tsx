import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Star, Clock, Users, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { mockFacilities } from '../../data/mockData';
import { properties } from '../../lib/supabase';

export default function HomePage() {
  const [postedProperties, setPostedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const popularSports = [
    { name: 'Badminton', icon: '🏸', color: 'bg-blue-100 text-blue-700' },
    { name: 'Tennis', icon: '🎾', color: 'bg-green-100 text-green-700' },
    { name: 'Basketball', icon: '🏀', color: 'bg-orange-100 text-orange-700' },
    { name: 'Football', icon: '⚽', color: 'bg-red-100 text-red-700' },
    { name: 'Cricket', icon: '🏏', color: 'bg-purple-100 text-purple-700' },
  ];

  const topVenues = mockFacilities.slice(0, 3);

  // Fetch real properties from Supabase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        console.log('Loading posted properties from facility_availability table...');
        const { data, error } = await properties.getAll();
        
        console.log('Properties response:', { data, error });
        
        if (error) {
          console.error('Error fetching properties:', error);
          return;
        }

        // Transform Supabase data to match our display format
        console.log('Raw properties data:', data);
        
        const transformedProperties = (data || []).map(prop => ({
          id: prop.id,
          property_name: prop.property_name,
          description: prop.description || `A ${prop.property_type?.replace('_', ' ')} facility`, // Generate description
          address: prop.address,
          property_type: prop.property_type,
          current_status: prop.current_status,
          is_sold: prop.is_sold,
          current_booking_start: prop.current_booking_start,
          current_booking_end: prop.current_booking_end,
          next_available_time: prop.next_available_time,
          total_booked_hours: prop.total_booked_hours || 0,
          monthly_booked_hours: prop.monthly_booked_hours || 0,
          sports: [prop.property_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Sports'], // Generate from property_type
          amenities: ['Basic Amenities'], // Default amenities
          pricePerHour: 25, // Default price since price_per_hour doesn't exist
          rating: 4.5, // Default rating
          reviewCount: 0, // Default review count
          isNew: true,
          owner: 'Facility Owner' // Default owner name
        }));
        
        console.log('Transformed properties:', transformedProperties);

        setPostedProperties(transformedProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Find & Book Sports Facilities Near You
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover amazing courts, fields, and facilities. Book instantly and play today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/venues"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Browse Venues
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                <MapPin className="mr-2 h-5 w-5" />
                Find Nearby
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">50+</div>
          <div className="text-gray-600 text-sm">Venues</div>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">1000+</div>
          <div className="text-gray-600 text-sm">Happy Users</div>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">5000+</div>
          <div className="text-gray-600 text-sm">Bookings</div>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Trophy className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">15</div>
          <div className="text-gray-600 text-sm">Sports Types</div>
        </div>
      </div>

      {/* Popular Sports */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular Sports</h2>
          <Link
            to="/venues"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {popularSports.map((sport) => (
            <Link
              key={sport.name}
              to={`/venues?sport=${sport.name.toLowerCase()}`}
              className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 border border-gray-100 hover:scale-105"
            >
              <div className="text-4xl mb-3">{sport.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{sport.name}</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${sport.color}`}>
                Popular
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Venues */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Venues</h2>
          <Link
            to="/venues"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {topVenues.map((venue) => (
            <Link
              key={venue.id}
              to={`/venues/${venue.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48">
                <img
                  src={venue.photos[0]}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold ml-1">{venue.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{venue.name}</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{venue.address.split(',')[1]}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {venue.sports.slice(0, 2).map((sport) => (
                    <span
                      key={sport}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg"
                    >
                      {sport}
                    </span>
                  ))}
                  {venue.sports.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                      +{venue.sports.length - 2} more
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      ${venue.priceRange.min}
                    </span>
                    <span className="text-gray-600 text-sm">/hour</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Available</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* New Properties from Facility Owners */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">New Properties</h2>
          <Link
            to="/venues"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {loading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : postedProperties.length === 0 ? (
            // No properties state
            <div className="md:col-span-3 text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties available yet</h3>
              <p className="text-gray-600">Check back later for new sports facilities!</p>
            </div>
          ) : (
            // Real properties from Supabase
            postedProperties.slice(0, 3).map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                  <div className="text-center">
                    <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-600 font-semibold">{property.property_type}</p>
                  </div>
                {property.isNew && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      NEW
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{property.property_name}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold ml-1">{property.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.address.split(',')[1]}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.sports.map((sport) => (
                    <span
                      key={sport}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      ${property.pricePerHour}
                    </span>
                    <span className="text-gray-600 text-sm">/hour</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {property.reviewCount} reviews
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Owner: {property.owner}
                </div>
                
                {/* Status and Availability */}
                <div className="mb-4 p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      property.current_status === 'active' ? 'bg-green-100 text-green-800' :
                      property.current_status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {property.current_status === 'active' ? 'Available' : 
                       property.current_status === 'maintenance' ? 'Under Maintenance' : 'Inactive'}
                    </span>
                  </div>
                  {property.is_sold && (
                    <div className="text-red-600 font-medium">⚠️ Property Sold</div>
                  )}
                  {property.current_booking_end && (
                    <div className="text-gray-600">
                      Booked until: {new Date(property.current_booking_end).toLocaleDateString()}
                    </div>
                  )}
                  {property.next_available_time && (
                    <div className="text-green-600">
                      Available from: {new Date(property.next_available_time).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <Link
                  to={`/venues/${property.id}`}
                  className={`w-full py-2 px-4 rounded-lg text-center transition-colors block ${
                    property.current_status === 'active' && !property.is_sold
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    if (property.current_status !== 'active' || property.is_sold) {
                      e.preventDefault();
                    }
                  }}
                >
                  {property.current_status === 'active' && !property.is_sold ? 'Book Now' : 'Not Available'}
                </Link>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Play?</h2>
        <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
          Join thousands of sports enthusiasts who trust QuickCourt for their facility bookings.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/venues"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Start Booking Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}