/**
 * Performance & Resource Consumption Benchmark Suite
 * Measures CPU, Memory (RSS, Heap, External), Latency, and Throughput under load
 */
import os from 'os';
import { buildApp } from '../apps/api/src/app';

process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_MAX = '10000';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://ibookky@localhost:5432/car_parts_catalog?schema=public';

async function runBenchmark() {
  console.log('================================================================');
  console.log(' 🚀 PERFORMANCE & RESOURCE CONSUMPTION BENCHMARK');
  console.log('================================================================');
  console.log(`OS: ${os.type()} ${os.release()} (${os.arch()})`);
  console.log(`CPU Cores: ${os.cpus().length} x ${os.cpus()[0]?.model || 'Generic'}`);
  console.log(`System Total RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`System Free RAM:  ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB\n`);

  const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  // Measure base memory before loading server
  const baseMem = process.memoryUsage();
  console.log('📊 Baseline Process Memory (Pre-load):');
  console.log(`   - RSS (Physical RAM):   ${formatMB(baseMem.rss)}`);
  console.log(`   - Heap Used (V8):       ${formatMB(baseMem.heapUsed)}`);
  console.log(`   - Heap Total:           ${formatMB(baseMem.heapTotal)}`);

  console.log('\n⏳ Initializing Fastify Application with Database Connection...');
  const startTime = Date.now();
  const app = await buildApp();
  // Silence verbose request logging during benchmark
  app.log.level = 'silent';
  await app.ready();
  const initDuration = Date.now() - startTime;
  console.log(`✅ App initialized in ${initDuration} ms`);

  // Warm-up
  await app.inject({ method: 'GET', url: '/health' });
  await app.inject({ method: 'GET', url: '/api/v1/settings' });

  const postInitMem = process.memoryUsage();
  console.log('\n📊 Post-Initialization Memory (Idle State):');
  console.log(`   - RSS (Physical RAM):   ${formatMB(postInitMem.rss)}`);
  console.log(`   - Heap Used (V8):       ${formatMB(postInitMem.heapUsed)}`);
  console.log(`   - Heap Total:           ${formatMB(postInitMem.heapTotal)}`);

  // Benchmark Endpoints
  const endpoints = [
    { name: 'Health Check (Zero DB)', method: 'GET' as const, url: '/health', count: 400 },
    { name: 'Settings (Micro-Cached)', method: 'GET' as const, url: '/api/v1/settings', count: 300 },
    { name: 'Category Tree (Micro-Cached)', method: 'GET' as const, url: '/api/v1/categories/tree', count: 200 },
    { name: 'Product Catalog (Lean DB Query)', method: 'GET' as const, url: '/api/v1/products?page=1&pageSize=12', count: 100 },
  ];

  console.log('\n================================================================');
  console.log(' ⚡ RUNNING STRESS TEST (1,000 Simulated User Requests)');
  console.log('================================================================');

  const startCpu = process.cpuUsage();
  const stressStart = Date.now();
  let totalRequests = 0;
  const latencies: number[] = [];

  for (const ep of endpoints) {
    const epStart = Date.now();
    const epLatencies: number[] = [];
    
    // Batch in concurrency of 20
    const batchSize = 20;
    for (let i = 0; i < ep.count; i += batchSize) {
      const currentBatch = Math.min(batchSize, ep.count - i);
      const batchPromises = Array.from({ length: currentBatch }).map(async (_, idx) => {
        const simIp = `192.168.${(i + idx) % 200}.${(i + idx) % 250 + 1}`;
        const reqStart = process.hrtime.bigint();
        const res = await app.inject({
          method: ep.method,
          url: ep.url,
          headers: {
            'x-forwarded-for': simIp,
          },
        });
        const reqEnd = process.hrtime.bigint();
        const latencyMs = Number(reqEnd - reqStart) / 1_000_000;
        epLatencies.push(latencyMs);
        latencies.push(latencyMs);
        totalRequests++;
      });
      await Promise.all(batchPromises);
    }

    const epDuration = (Date.now() - epStart) / 1000;
    const epRps = (ep.count / epDuration).toFixed(0);
    const avgLatency = (epLatencies.reduce((a, b) => a + b, 0) / epLatencies.length).toFixed(2);
    epLatencies.sort((a, b) => a - b);
    const p95 = epLatencies[Math.floor(epLatencies.length * 0.95)].toFixed(2);

    console.log(`📌 ${ep.name}:`);
    console.log(`   ${ep.count} reqs in ${epDuration.toFixed(2)}s | ${epRps} req/s | Avg: ${avgLatency} ms | P95: ${p95} ms`);
  }

  const stressDuration = (Date.now() - stressStart) / 1000;
  const cpuUsage = process.cpuUsage(startCpu);
  const totalCpuMs = (cpuUsage.user + cpuUsage.system) / 1000;
  const cpuPercentage = ((totalCpuMs / (stressDuration * 1000)) * 100).toFixed(1);

  const postStressMem = process.memoryUsage();

  latencies.sort((a, b) => a - b);
  const totalAvgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
  const globalP50 = latencies[Math.floor(latencies.length * 0.50)].toFixed(2);
  const globalP95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
  const globalP99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2);
  const overallRps = (totalRequests / stressDuration).toFixed(0);

  console.log('\n================================================================');
  console.log(' 🏁 BENCHMARK RESULTS & RESOURCE USAGE');
  console.log('================================================================');
  console.log(`Total Requests Processed: ${totalRequests.toLocaleString()}`);
  console.log(`Total Duration:           ${stressDuration.toFixed(2)} s`);
  console.log(`Throughput (RPS):         ${overallRps} requests/sec`);
  console.log(`CPU Utilization:          ${cpuPercentage}% average during load`);
  console.log(`Latency Breakdown:`);
  console.log(`   - P50 (Median):        ${globalP50} ms`);
  console.log(`   - Average:             ${totalAvgLatency} ms`);
  console.log(`   - P95:                 ${globalP95} ms`);
  console.log(`   - P99:                 ${globalP99} ms`);

  console.log(`\nRAM Memory Usage (Under Load):`);
  console.log(`   - RSS (Physical RAM):   ${formatMB(postStressMem.rss)}`);
  console.log(`   - Heap Used:            ${formatMB(postStressMem.heapUsed)}`);
  console.log(`   - Heap Total:           ${formatMB(postStressMem.heapTotal)}`);

  await new Promise((r) => setTimeout(r, 1000));
  const settledMem = process.memoryUsage();
  console.log(`\nRAM Memory Usage (Settled After Load):`);
  console.log(`   - RSS (Physical RAM):   ${formatMB(settledMem.rss)}`);
  console.log(`   - Heap Used:            ${formatMB(settledMem.heapUsed)}`);
  console.log('================================================================\n');

  await app.close();
  process.exit(0);
}

runBenchmark().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
