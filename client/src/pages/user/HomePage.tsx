import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Star, Clock, Users, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { mockFacilities } from '../../data/mockData';

export default function HomePage() {
  const popularSports = [
    { name: 'Badminton', icon: '🏸', color: 'bg-blue-100 text-blue-700' },
    { name: 'Tennis', icon: '🎾', color: 'bg-green-100 text-green-700' },
    { name: 'Basketball', icon: '🏀', color: 'bg-orange-100 text-orange-700' },
    { name: 'Football', icon: '⚽', color: 'bg-red-100 text-red-700' },
    { name: 'Cricket', icon: '🏏', color: 'bg-purple-100 text-purple-700' },
  ];

  const topVenues = mockFacilities.slice(0, 3);

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