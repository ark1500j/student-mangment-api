import express, { Express, Request, Response } from "express";
import client from "prom-client";
import logger from "./logger";

const metricsApp: Express = express();
export const restResponseTimeHistogram = new client.Histogram({
  name: "rest_response_time_duration_seconds",
  help: "REST API response time in secondes",
  labelNames: ["method", "route", "status_code"],
});
export const databaseResponseTimeHistogram = new client.Histogram({
  name: "db_response_time_duration_seconds",
  help: "DATABASE response time in secondes",
  labelNames: ["operation", "collection", "success"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});
export default function startMetricsServer() {
  const colletctDefaultMetrics = client.collectDefaultMetrics;
  colletctDefaultMetrics();
  metricsApp.get("/metrics", async (req: Request, res: Response) => {
    res.set("Content-Type", client.register.contentType);

    res.send(await client.register.metrics());
  });

  metricsApp.listen(9100, () => {
    logger.info("Metrics server listening on http://localhost:9100");
  });
}
