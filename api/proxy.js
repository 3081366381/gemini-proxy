export const config = {
  runtime: 'edge',
  regions: ['iad1'], // 强制美国华盛顿节点
};

export default async function handler(request) {
  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api/proxy', ''); // 去掉我们的代理路径前缀
  const targetUrl = `https://generativelanguage.googleapis.com${apiPath}${url.search}`;

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
