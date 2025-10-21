"use client";

import { useParams } from "next/navigation";

const ConsignmentDetails = () => {
  const { id } = useParams();
  return (
    <div className="mt-20">
      <p>{id}</p>
    </div>
  );
};

export default ConsignmentDetails;
