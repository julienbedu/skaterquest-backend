export const aggregateSpotByLoc = (lon, lat, limit) => {
  return [
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
};
