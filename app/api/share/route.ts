import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Project, Marker, Route, Image } from '@/types';

// Initialize Supabase client for server-side API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Interface for the combined shared project response
 */
interface SharedProjectResponse {
  project: Project;
  markers: Marker[];
  routes: Route[];
  imagesByFeature: Record<string, Image[]>;
}

/**
 * GET endpoint to fetch a shared project by ID with all its data
 * @param request The Next.js request object
 * @returns The shared project with markers, routes, and images if found
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');
    
    if (!shareId) {
      return NextResponse.json({ error: 'Share ID not provided' }, { status: 400 });
    }
    
    // Fetch the project that is shared
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('share_url', shareId)
      .single();
      
    if (projectError || !projectData) {
      return NextResponse.json({ error: 'Shared project not found' }, { status: 404 });
    }
    
    // Check if the project is shared
    if (!projectData.is_shared) {
      return NextResponse.json({ error: 'This project is not shared' }, { status: 403 });
    }
    
    const projectId = projectData.id;
    
    // Fetch markers for the project
    const { data: markersData, error: markersError } = await supabase
      .from('markers')
      .select('*')
      .eq('project_id', projectId);
      
    if (markersError) {
      return NextResponse.json({ error: 'Error fetching markers' }, { status: 500 });
    }
    
    // Fetch routes for the project
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .eq('project_id', projectId);
      
    if (routesError) {
      return NextResponse.json({ error: 'Error fetching routes' }, { status: 500 });
    }
    
    // Initialize the image collection by feature
    const imagesByFeature: Record<string, Image[]> = {};
    
    // Fetch all images for markers
    if (markersData && markersData.length > 0) {
      const markerIds = markersData.map(marker => marker.id);
      
      const { data: markerImagesData, error: markerImagesError } = await supabase
        .from('images')
        .select('*')
        .eq('entity_type', 'marker')
        .in('entity_id', markerIds);
      
      if (markerImagesError) {
        return NextResponse.json({ error: 'Error fetching marker images' }, { status: 500 });
      }
      
      // Process marker images and organize by entity_id
      if (markerImagesData) {
        for (const image of markerImagesData) {
          const key = `marker_${image.entity_id}`;
          
          if (!imagesByFeature[key]) {
            imagesByFeature[key] = [];
          }
          
          // Generate public URL for storage images
          if (image.storage_path) {
            const { data: urlData } = supabase.storage
              .from('trailnote')
              .getPublicUrl(image.storage_path);
              
            imagesByFeature[key].push({
              ...image,
              url: urlData.publicUrl
            } as Image);
          } else {
            // For direct URL images, use the URL as is
            imagesByFeature[key].push(image as Image);
          }
        }
      }
    }
    
    // Fetch all images for routes
    if (routesData && routesData.length > 0) {
      const routeIds = routesData.map(route => route.id);
      
      const { data: routeImagesData, error: routeImagesError } = await supabase
        .from('images')
        .select('*')
        .eq('entity_type', 'route')
        .in('entity_id', routeIds);
      
      if (routeImagesError) {
        return NextResponse.json({ error: 'Error fetching route images' }, { status: 500 });
      }
      
      // Process route images and organize by entity_id
      if (routeImagesData) {
        for (const image of routeImagesData) {
          const key = `route_${image.entity_id}`;
          
          if (!imagesByFeature[key]) {
            imagesByFeature[key] = [];
          }
          
          // Generate public URL for storage images
          if (image.storage_path) {
            const { data: urlData } = supabase.storage
              .from('trailnote')
              .getPublicUrl(image.storage_path);
              
            imagesByFeature[key].push({
              ...image,
              url: urlData.publicUrl
            } as Image);
          } else {
            // For direct URL images, use the URL as is
            imagesByFeature[key].push(image as Image);
          }
        }
      }
    }
    
    // Construct the response
    const response: SharedProjectResponse = {
      project: projectData as Project,
      markers: markersData as Marker[] || [],
      routes: routesData as Route[] || [],
      imagesByFeature
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching shared project data:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
