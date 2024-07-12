"use client";
import { formatToIndianNumber } from "@/lib/utils";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function ArtistPricing({ artist }) {
  return (
    <div className="bg-white shadow-lg p-4 border border-gray-200 rounded-lg mt-5 md:ml-2">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Pricing</h2>
      <div className="space-y-2">
        {artist.price && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Wedding Event:</span>
              <span className="font-medium text-gray-900 whitespace-nowrap">
                ₹ {formatToIndianNumber(artist.price)}
              </span>
            </div>
            <hr />
          </>
        )}
        {artist.corporateBudget && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Corporate Event:</span>
              <span className="font-medium text-gray-900 whitespace-nowrap">
                ₹ {formatToIndianNumber(artist.corporateBudget)}
              </span>
            </div>
            <hr />
          </>
        )}
        {artist.collegeBudget && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">College Event:</span>
              <span className="font-medium text-gray-900 whitespace-nowrap">
                ₹ {formatToIndianNumber(artist.collegeBudget)}
              </span>
            </div>
            <hr />
          </>
        )}
        {artist.singerCumGuitaristBudget && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">House/Private Event:</span>
              <span className="font-medium text-gray-900 whitespace-nowrap">
                ₹ {formatToIndianNumber(artist.singerCumGuitaristBudget)}
              </span>
            </div>
            <hr />
          </>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Note: Sound Charges will be added extra.
      </p>
    </div>
  );
}

export default ArtistPricing;
