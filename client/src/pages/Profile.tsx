import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Shield, Wallet, Coins, Award } from "lucide-react";
import type { PlayerData } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const { data: playerData, isLoading } = useQuery<PlayerData>({
    queryKey: ["/api/profile"],
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You need to be logged in to view your profile</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Player Profile</h1>
          <p className="text-muted-foreground mt-1">View and manage your character stats</p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back Home
          </Button>
        </Link>
      </div>

      {/* Profile Header */}
      <Card className="mb-6" data-testid="card-profile-header">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-username">
                {user.username}
              </h2>
              {playerData && (
                <p className="text-muted-foreground" data-testid="text-mta-name">
                  MTA Name: {playerData.mtaName}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
            {playerData && (
              <div className="flex gap-2">
                <Badge variant="secondary" data-testid="badge-level">
                  Level {playerData.level}
                </Badge>
                {user.mtaUsername && (
                  <Badge variant="outline" data-testid="badge-account">
                    {user.mtaUsername}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Character Stats */}
      {playerData && (
        <>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {/* Health & Armor */}
            <Card data-testid="card-health">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-red-500" />
                  Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-health">
                  {Number(playerData.health).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Character Health</p>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${Math.min(Number(playerData.health), 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-armor">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Armor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-armor">
                  {Number(playerData.armor).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Character Armor</p>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(Number(playerData.armor), 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Money & Coins */}
            <Card data-testid="card-money">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Wallet className="h-4 w-4 text-green-500" />
                  Money
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600" data-testid="text-money">
                  ${Number(playerData.money).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">In-game money</p>
              </CardContent>
            </Card>

            <Card data-testid="card-coins">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-amber-500" />
                  City Coins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600" data-testid="text-city-coins">
                  {Number(playerData.cityCoins).toLocaleString("en-US")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Premium currency</p>
              </CardContent>
            </Card>
          </div>

          {/* Experience & Level */}
          <Card data-testid="card-experience">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                Experience & Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Level {playerData.level}</span>
                  <span className="text-sm text-muted-foreground">
                    {playerData.experience.toLocaleString()} EXP
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${Math.min((playerData.experience % 1000) / 10, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {(1000 - (playerData.experience % 1000)).toLocaleString()} EXP until next level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Serial Info */}
          <Card className="mt-6" data-testid="card-serial-info">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Serial</p>
                  <p className="font-mono text-sm break-all" data-testid="text-serial">
                    {playerData.serial}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm" data-testid="text-last-updated">
                    {new Date(playerData.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
