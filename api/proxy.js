export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

export default async function handler(request) {
  const url = new URL(request.url);
  
  // 核心修改：我们不用路径匹配了，太容易错。我们直接用 ?path=/v1beta/models 参数来传！
  // 这样 Vercel 绝对不会报 404，因为文件路径就是死的 /api/proxy
  const path = url.searchParams.get('path');
  
  if (!path) {
    return new Response('Missing path parameter', { status: 400 });
  }

  // 剩下的查询参数（比如 key）要补回去
  const newSearchParams = new URLSearchParams(url.searchParams);
  newSearchParams.delete('path'); // 把 path 拿出来，剩下的就是参数
  
  const targetUrl = `https://generativelanguage.googleapis.com${path}?${newSearchParams.toString()}`;

  const newHeaders = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) newHeaders.set('Content-Type', contentType);
  newHeaders.set('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.body
    });

    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    return newResponse;
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
