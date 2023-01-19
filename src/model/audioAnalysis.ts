import { MeydaFeaturesObject } from 'meyda';
import { NormalizedValue, applyNormalizedValue } from '../utils/math';

export const featureGetters = {
    "rms": (features : Partial<MeydaFeaturesObject>) => features.rms,
    "loudness": (features : Partial<MeydaFeaturesObject>) => features.loudness.total,
    "spectralCentroid": (features : Partial<MeydaFeaturesObject>) => features.spectralCentroid,
    "spectralFlatness": (features : Partial<MeydaFeaturesObject>) => features.spectralFlatness,
    "spectralRolloff": (features : Partial<MeydaFeaturesObject>) => features.spectralRolloff,
    "spectralSpread": (features : Partial<MeydaFeaturesObject>) => features.spectralSpread,
    "spectralSkewness": (features : Partial<MeydaFeaturesObject>) => features.spectralSkewness,
    "spectralKurtosis": (features : Partial<MeydaFeaturesObject>) => features.spectralKurtosis,
    "zcr": (features : Partial<MeydaFeaturesObject>) => features.zcr,
    "spectralSlope": (features : Partial<MeydaFeaturesObject>) => features.spectralSlope,
    "perceptualSpread": (features : Partial<MeydaFeaturesObject>) => features.perceptualSpread,
    "perceptualSharpness": (features : Partial<MeydaFeaturesObject>) => features.perceptualSharpness,
    "MFCC-0": (features : Partial<MeydaFeaturesObject>) => features.mfcc[0],
    "MFCC-1": (features : Partial<MeydaFeaturesObject>) => features.mfcc[1],
    "MFCC-2": (features : Partial<MeydaFeaturesObject>) => features.mfcc[2],
    "MFCC-3": (features : Partial<MeydaFeaturesObject>) => features.mfcc[3],
    "MFCC-4": (features : Partial<MeydaFeaturesObject>) => features.mfcc[4],
    "MFCC-5": (features : Partial<MeydaFeaturesObject>) => features.mfcc[5],
    "MFCC-6": (features : Partial<MeydaFeaturesObject>) => features.mfcc[6],
    "MFCC-7": (features : Partial<MeydaFeaturesObject>) => features.mfcc[7],
    "MFCC-8": (features : Partial<MeydaFeaturesObject>) => features.mfcc[8]
}

export function initializeNormalizedFeatures(
    features : Partial<MeydaFeaturesObject>) 
{
    // const normFeatures = {...features};
    const normFeatures : any = {};

    for(const [key, getter] of Object.entries(featureGetters)) {
        const value = getter(features);
        normFeatures[key] = {
            origValue: value,
            normValue: 0,
            min: Infinity,
            max: -Infinity,
            avg: {
                norm: 0.5,
                orig: value,
                count: 0
            }
        };
    }
    return normFeatures;
}

/** Get a feature by its Meyda name that is normalized */
export function getNormFeature(
    normFeatures: Partial<MeydaFeaturesObject> | any,
    featureName : string,
    scalar: number = 1,
    key : string = "value")
{
    return normFeatures[featureName][key] * scalar;
}

export function getFeature(features : Partial<MeydaFeaturesObject>, featureName: string) : number {
    // @ts-ignore
    const fn = featureGetters[featureName];
    if (fn) return fn(features);
    console.error(`Feature ${featureName} not found`);
    return 0;
}

/** Normalize Meyda features given a featuresNorm context */
export function normalizeFeatures(
    features : Partial<MeydaFeaturesObject>, 
    normFeatures : Partial<MeydaFeaturesObject> | null = null)
{
    // if supplied with a null value, initialize a new object
    if (normFeatures == null) {
        console.log("Initializing new normalized features object")
        // normFeatures = {...features}
        normFeatures = initializeNormalizedFeatures(features);
    };
    for (const key of Object.keys(featureGetters)) {
        const value = getFeature(features, key) as number;
        // @ts-ignore
        // const normValue = getFeature(normFeatures, key) as NormalizedValue;
        const normValue = normFeatures[key];
        applyNormalizedValue(value, normValue);
    }
    return normFeatures;
}

export const getNormalizedMFCCS = (normFeatures : any, scalar : number = 1) => {
    const mfccs = []; 
    for (let i = 0; i < 8; i++) {
        mfccs.push(getNormFeature(normFeatures, `MFCC-${i}`, scalar));
    }
    return mfccs;
}