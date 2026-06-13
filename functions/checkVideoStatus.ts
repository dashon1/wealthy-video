import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = await req.json();
    
    if (!templateId) {
      return Response.json({ error: 'templateId is required' }, { status: 400 });
    }

    // Get the template
    const template = await base44.entities.Template.get(templateId);
    
    if (!template || !template.video_project_id) {
      // No project to check yet - return a neutral status
      return Response.json({ status: 'pending' });
    }

    // Check status with JSON2Video API
    const apiKey = Deno.env.get('JSON2VIDEO_API_KEY');
    if (!apiKey) {
      console.error('JSON2VIDEO_API_KEY not found in environment');
      return Response.json({ error: 'JSON2VIDEO_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch(`https://api.json2video.com/v2/movies?project=${template.video_project_id}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ 
        error: 'Failed to check video status', 
        details: result 
      }, { status: response.status });
    }

    // Update template based on status
    const updateData = {};
    
    if (result.status === 'done') {
      updateData.video_status = 'completed';
      updateData.video_url = result.url;
    } else if (result.status === 'error') {
      updateData.video_status = 'failed';
    } else {
      updateData.video_status = 'processing';
    }

    await base44.entities.Template.update(templateId, updateData);

    return Response.json({
      status: result.status,
      videoUrl: result.url || null,
      progress: result.progress || 0
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});