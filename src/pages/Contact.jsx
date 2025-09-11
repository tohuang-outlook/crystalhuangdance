
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, Phone, MapPin, Clock, 
  Instagram, Youtube, Twitter, 
  Calendar, Star, Send, CheckCircle 
} from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    details: "crystalhuangdance@gmail.com",
    description: "Best for booking inquiries and collaborations",
    color: "text-pink-500"
  },
  {
    icon: Phone,
    title: "Phone",
    details: "+1 (123)456-7890",
    description: "Available Mon-Fri, 10am-5pm PST",
    color: "text-purple-500"
  },
  {
    icon: MapPin,
    title: "Based in",
    details: "Fremont, California",
    description: "Available for performances worldwide",
    color: "text-indigo-500"
  },
  {
    icon: Clock,
    title: "Response Time",
    details: "Within 24 hours",
    description: "Usually respond within a few hours",
    color: "text-green-500"
  }
];

const services = [
  {
    title: "Choreography Services",
    description: "Custom choreography for your project",
    price: "Quote on request",
    features: [
      "Original choreography",
      "Video documentation",
      "Teaching sessions",
      "Usage rights included"
    ]
  },
  {
    title: "Private Lessons",
    description: "One-on-one dance instruction",
    price: "$100 per hour", // Updated price as per the outline
    features: [
      "Personalized instruction",
      "All skill levels",
      "Multiple dance styles",
      "Flexible scheduling"
    ]
  }
];

const socialLinks = [
  { 
    icon: Instagram, 
    label: "Instagram", 
    handle: "@crystalhuangdance", 
    link: "https://instagram.com/crystalhuangdance",
    color: "hover:text-pink-600" 
  },
  { 
    icon: Youtube, 
    label: "YouTube", 
    handle: "https://www.youtube.com/@tohuang", 
    link: "https://www.youtube.com/@tohuang",
    color: "hover:text-red-600" 
  },
  { 
    icon: Twitter, 
    label: "Twitter", 
    handle: "@crystalhuangdance", 
    link: "https://twitter.com/crystalhuangdance",
    color: "hover:text-blue-600" 
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    venue: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-50 flex items-center justify-center">
        <Card className="max-w-lg mx-4 text-center elegant-shadow">
          <CardContent className="p-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your inquiry. I'll get back to you within 24 hours to discuss your performance needs.
            </p>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '', email: '', phone: '', eventType: '', eventDate: '', venue: '', message: ''
                });
              }}
              variant="outline"
              className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white"
            >
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-3xl movement-animation"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-80 h-80 bg-gradient-to-r from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl movement-animation delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <Badge className="mb-6 bg-pink-100 text-pink-700 hover:bg-pink-200">
            <Calendar className="w-4 h-4 mr-2" />
            Book a Performance
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Let's Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Magic</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-4xl mx-auto">
            Whether you're planning a wedding, corporate event, or special celebration, 
            let's discuss how dance can transform your vision into an unforgettable experience.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="bg-white elegant-shadow">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Get in Touch
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                        placeholder="crystal@danceartist.com" // Updated email placeholder
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventType">Event Type *</Label>
                      <select
                        id="eventType"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleInputChange}
                        required
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="">Select event type</option>
                        <option value="performance">Public performance</option>
                        <option value="lessons">Private Lessons</option>
                        <option value="choreography">Choreography services</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="eventDate">Event Date</Label>
                      <Input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="venue">Venue/Location</Label>
                      <Input
                        id="venue"
                        name="venue"
                        value={formData.venue}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="Event location"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Tell me about your vision *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="mt-2"
                      placeholder="Describe your event, preferred dance style, expected audience size, budget range, and any special requirements..."
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full dance-gradient text-white hover:opacity-90 transition-opacity"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
                {/* New contact email information added here after the form */}
                <p className="text-gray-400 text-sm mt-6">
                  Ready to schedule a private?<br />
                  <a href="mailto:crystalhuangdance@gmail.com" className="text-pink-400 hover:text-pink-300 transition-colors">
                    crystalhuangdance@gmail.com
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & Services */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card className="bg-white elegant-shadow">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <info.icon className={`w-6 h-6 ${info.color}`} />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                        <p className="font-medium text-gray-800">{info.details}</p>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Follow My Journey
                </h3>
                <div className="space-y-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-4 p-3 bg-white rounded-lg hover:shadow-md transition-all duration-200 ${social.color}`}
                    >
                      <social.icon className="w-6 h-6" />
                      <div>
                        <p className="font-medium text-gray-900">{social.label}</p>
                        <p className="text-sm text-gray-600">{social.handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Services Overview */}
            <Card className="bg-white elegant-shadow">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Service Packages
                </h3>
                <div className="space-y-6">
                  {services.map((service, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{service.title}</h4>
                        <Badge variant="outline" className="text-pink-600 border-pink-600">
                          {service.price}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <Star className="w-3 h-3 mr-2 text-pink-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
