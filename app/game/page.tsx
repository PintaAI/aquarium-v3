"use client";
import React from 'react';
import Link from "next/link";
import { games } from "@/data/games";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

const GamePage = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter games based on search
  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Game Pembelajaran
        </h1>
        <p className="text-primary/80 max-w-2xl mx-auto">
          Pilih game edukasi yang sesuai dengan kebutuhan belajarmu. Setiap game dirancang untuk membantu memahami Bahasa Korea dengan cara yang menyenangkan.
        </p>
      </div>

      {/* Search Section */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/80 w-4 h-4"
          />
          <input
            type="text"
            placeholder="Cari game..."
            className="w-full pl-10 pr-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search games"
          />
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => {
          const Icon = game.icon;
          return (
            <div key={game.id}>
              <Link href={game.route} className="group block">
                <Card className="h-full transition-transform transform hover:scale-105 hover:shadow-2xl rounded-lg overflow-hidden">
                  <CardContent className="p-6 bg-background">
                    <div className="mb-6 flex justify-center">
                      <div className="p-4 bg-secondary rounded-full group-hover:bg-primary transition-colors">
                        <Icon className="w-8 h-8 text-primary group-hover:text-white" />
                      </div>
                    </div>
                    <div className="space-y-2 text-center">
                      <h2 className="text-xl font-semibold text-primary group-hover:text-white transition-colors">
                        {game.title}
                      </h2>
                      <p className="text-primary/80 group-hover:text-white transition-colors">
                        {game.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredGames.length === 0 && (
        <div className="text-center py-10">
          <p className="text-primary/80">
            Tidak ada game yang sesuai dengan pencarian Anda.
          </p>
        </div>
      )}
    </div>
  );
};

export default GamePage;
