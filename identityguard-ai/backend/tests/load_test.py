import asyncio
import aiohttp
import time
import os
from loguru import logger

BASE_URL = "http://localhost:8000"
NUM_REQUESTS = 50 # Start with 50 simultaneous registrations

async def register_user(session, i):
    # Prepare a dummy image file payload
    # In a real payload test, we would hit real images, but to test pure rate limits & payloads:
    dummy_image_data = b"dummy_image_payload" * 1024 # 19KB dummy file
    
    data = aiohttp.FormData()
    data.add_field('name', f'Load Test User {i}')
    data.add_field('email', f'load.test.{time.time()}.{i}@example.com')
    data.add_field('image', dummy_image_data, filename=f'test_image_{i}.jpg', content_type='image/jpeg')
    
    try:
        start_t = time.time()
        async with session.post(f"{BASE_URL}/api/register/", data=data) as response:
            status = response.status
            text = await response.text()
            latency = time.time() - start_t
            return {"status": status, "latency": latency, "response": text}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}

async def load_test():
    logger.info(f"Starting Load Test: {NUM_REQUESTS} Simultaneous Registrations")
    start_time = time.time()
    
    async with aiohttp.ClientSession() as session:
        tasks = [register_user(session, i) for i in range(NUM_REQUESTS)]
        results = await asyncio.gather(*tasks)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    status_counts = {}
    error_msgs = []
    for r in results:
        status = r.get("status")
        if status == "ERROR":
            error_msgs.append(r.get("error", "Unknown"))
        status_counts[status] = status_counts.get(status, 0) + 1
        
    logger.info("--- LOAD TEST RESULTS ---")
    logger.info(f"Total Requests: {NUM_REQUESTS}")
    logger.info(f"Total Time: {total_time:.2f} seconds")
    logger.info(f"Requests/Second: {NUM_REQUESTS/total_time:.2f}")
    logger.info("Status Distribution:")
    for status, count in status_counts.items():
        logger.info(f"  {status}: {count} ({(count/NUM_REQUESTS)*100:.1f}%)")
        
    if error_msgs:
        logger.error(f"First Error Sample: {error_msgs[0]}")
        
    # We expect HTTP 429 Too Many Requests due to `slowapi` 5/min limit.
    if 429 in status_counts:
        logger.success(f"Rate Limiting Works! Blocked {status_counts[429]} requests.")
    else:
        logger.warning("No 429 errors observed - Rate limits might not be restricting properly if count > 5.")

if __name__ == "__main__":
    asyncio.run(load_test())
