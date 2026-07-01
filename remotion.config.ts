import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// The composition is fully data-driven from --props, so no entry-point tweaks needed.
