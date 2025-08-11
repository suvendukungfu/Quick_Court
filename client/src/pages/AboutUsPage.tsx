import React from 'react';
import { Trophy, Users, Target, Heart } from 'lucide-react';

const AboutUsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-600 rounded-full">
            <Trophy className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About QuickCourt</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Revolutionizing sports facility booking with AI-powered insights and seamless user experience
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            At QuickCourt, we're passionate about making sports accessible to everyone. Our platform 
            connects athletes with premium sports facilities while providing AI-powered coaching 
            insights to help users improve their game.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <Target className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <span>Easy booking of sports courts and facilities</span>
            </li>
            <li className="flex items-start">
              <Users className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <span>AI-powered coaching and performance insights</span>
            </li>
            <li className="flex items-start">
              <Heart className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <span>Community-driven sports experience</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Join Our Community</h3>
        <p className="text-gray-600">
          Whether you're a casual player or a serious athlete, QuickCourt is designed to enhance 
          your sports experience. Book courts, track your progress, and connect with fellow 
          sports enthusiasts all in one place.
        </p>
      </div>
    </div>
  );
};

export default AboutUsPage;
