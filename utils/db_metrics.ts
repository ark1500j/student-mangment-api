import mongoose from "mongoose";
import { databaseResponseTimeHistogram } from "./metrics";

export default function mongooseMetricsPlugin(schema: mongoose.Schema) {
  // Pre-hook: Start Timer Before Query Execution
  schema.pre(/^find|create|updateOne|deleteOne|aggregate/, function (next) {
    (this as any)._timer = databaseResponseTimeHistogram.startTimer(); // Start timer
    next();
  });

  // Post-hook: Stop Timer After Query Execution
  schema.post(
    /^find|create|updateOne|deleteOne|aggregate/,
    function (res, next) {
      if (!(this as any)._timer) {
        next(); // Skip if no timer (error case)
        return;
      }

      // Stop timer and record metric
      (this as any)._timer({
        operation: (this as any).op || "unknown",
        collection: (this as any).model?.collection?.name || "unknown",
        success: res ? "true" : "false",
      });

      next();
    }
  );
}
