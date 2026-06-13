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
    
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Parse the JSON template
    let jsonTemplate;
    try {
      jsonTemplate = JSON.parse(template.json_output);
    } catch (error) {
      return Response.json({ error: 'Invalid JSON template' }, { status: 400 });
    }

    // Call JSON2Video API
    const apiKey = Deno.env.get('JSON2VIDEO_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'JSON2VIDEO_API_KEY not configured' }, { status: 500 });
    }

    console.log('Calling JSON2Video API...');
    console.log('JSON Template:', JSON.stringify(jsonTemplate, null, 2));
    
    const response = await fetch('https://api.json2video.com/v2/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(jsonTemplate)
    });

    const result = await response.json();
    console.log('JSON2Video Response:', response.status, result);

    if (!response.ok) {
      await base44.entities.Template.update(templateId, {
        video_status: 'failed'
      });
      return Response.json({ 
        error: 'Video generation failed', 
        details: result 
      }, { status: response.status });
    }

    // Update template with project ID
    await base44.entities.Template.update(templateId, {
      video_status: 'processing',
      video_project_id: result.project
    });

    return Response.json({
      success: true,
      projectId: result.project,
      message: 'Video generation started'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});