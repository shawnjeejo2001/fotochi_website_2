import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const style = searchParams.get("style");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = Number.parseInt(searchParams.get("radius") || "50");

    let query = supabase
      .from("providers")
      .select("*")
      .eq("status", "approved");

    if (style && style !== "all") {
      query = query.eq("main_style", style);
    }

    const { data: providers, error } = await query;

    if (error) {
      console.error("Error fetching providers:", error);
      return NextResponse.json(
        { error: "Failed to fetch photographers", success: false },
        { status: 500 }
      );
    }

    let results = providers || [];

    if (lat && lng && results.length > 0) {
      const searchLat = parseFloat(lat);
      const searchLng = parseFloat(lng);

      results = results
        .map((provider) => {
          if (!provider.latitude || !provider.longitude) {
            return { ...provider, distance: null };
          }

          const R = 3959;
          const dLat = (provider.latitude - searchLat) * (Math.PI / 180);
          const dLon = (provider.longitude - searchLng) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(searchLat * (Math.PI / 180)) *
              Math.cos(provider.latitude * (Math.PI / 180)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return { ...provider, distance };
        })
        .filter((provider) => provider.distance === null || provider.distance <= radius)
        .sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }

    const transformedPhotographers = results.map((provider) => ({
      id: provider.id,
      name: provider.name,
      location: provider.location,
      mainStyle: provider.main_style,
      main_style: provider.main_style,
      additionalStyles: provider.additional_styles || [],
      rating: provider.rating || 0,
      reviews: provider.review_count || 0,
      price: provider.price_range,
      price_range: provider.price_range,
      profile_image: provider.profile_picture_url || "/placeholder-user.jpg",
      portfolioImage: provider.profile_picture_url || "/placeholder-user.jpg",
      featured_images: provider.portfolio_images || [],
      portfolioImages: provider.portfolio_images || [],
      coordinates: {
        lat: provider.latitude,
        lng: provider.longitude,
      },
      distance: (provider as any).distance,
    }));

    return NextResponse.json({
      photographers: transformedPhotographers,
      total: transformedPhotographers.length,
      success: true,
      source: "database",
    });
  } catch (error) {
    console.error("Error in photographer search:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}
