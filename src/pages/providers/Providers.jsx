import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProvidersMap from "@/components/ProvidersMap";

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/providers");
        setProviders(res.data.data.data);
      } catch (err) {
        console.error("Error fetching providers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Our Trusted Service Providers
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Find the best professionals for your home needs
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Providers List Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters/Search Bar (placeholder) */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search providers..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Professions</option>
                  <option>Cleaner</option>
                  <option>Plumber</option>
                  <option>Electrician</option>
                </select>
              </div>
            </div>

            {/* Providers Grid */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {providers.map((provider) => (
                  <Card
                    key={provider.id}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader className="flex flex-row items-start gap-4 pb-3">
                      <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                        <AvatarImage
                          src={
                            provider.avatar &&
                            provider.avatar !== "http://localhost:8000/storage/null"
                              ? provider.avatar
                              : "/default-avatar.png"
                          }
                          alt={provider.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          {provider.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <p className="text-sm text-gray-500 font-medium">
                          {provider.profession}
                        </p>
                        <Badge
                          variant={provider.is_approved ? "default" : "secondary"}
                          className="mt-1"
                        >
                          {provider.is_approved ? "Verified" : "Pending Approval"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1 font-medium text-gray-900">
                            {provider.rating}
                          </span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          • {provider.reviews_count} reviews
                        </span>
                        <span className="text-gray-500 text-sm">
                          • {provider.years_of_experience} years experience
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {provider.services?.slice(0, 3).map((service, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {provider.services?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{provider.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Map Column */}
          <div className="lg:col-span-1 sticky top-8 h-[calc(100vh-100px)]">
            {loading ? (
              <div className="h-full bg-gray-100 rounded-xl flex items-center justify-center shadow-inner">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-blue-600 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Loading map...</p>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                <div className="h-full flex flex-col">
                  <div className="bg-white px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-800">
                      Provider Locations
                    </h3>
                  </div>
                  <ProvidersMap providers={providers} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}