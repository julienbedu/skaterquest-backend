/*
 Pipeline d'aggrégation pour les requètes plus complexes.
*/


/*
Renvoie les {limit} plus proches spot du point [lon,lat]
*/
export const aggregateSpotByLocation = (lon, lat, limit = null) => [
  {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [lon, lat],
      },
      distanceField: "distance",
      spherical: true,
    },
  },
  {
    $limit: limit ?? 10,
  },
];
