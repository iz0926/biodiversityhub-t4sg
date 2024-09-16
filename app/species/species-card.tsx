"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import EditSpeciesDialog from "./edit-species-dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useRouter } from "next/navigation";

// Interface for the species object
interface Species {
  id: number;
  author: string;
  scientific_name: string;
  common_name: string | null;
  kingdom: "Animalia" | "Plantae" | "Fungi" | "Protista" | "Archaea" | "Bacteria";
  total_population: number | null;
  description: string | null;
  image: string | null;
}

// The main SpeciesCard component
export default function SpeciesCard({ species, sessionId }: { species: Species; sessionId: string }) {
  const [open, setOpen] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false); // For delete confirmation
  const [currentSpecies, setCurrentSpecies] = useState<Species>(species); // Store the updated species
  const router = useRouter();

  // Supabase client
  const supabase = createBrowserSupabaseClient();

  // Handler to update species data after editing
  const handleSpeciesUpdated = (updatedSpecies: Species) => {
    setCurrentSpecies(updatedSpecies); // Update species state with new data
  };

  // Handler for deleting the species
  const handleDeleteSpecies = async () => {
    try {
      const { error } = await supabase.from("species").delete().eq("id", currentSpecies.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Species deleted",
        description: "The species has been deleted successfully.",
      });
      router.refresh();

      // could remove this species from the list or refresh the page here
      // e.g. refresh the species list in the parent component
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error deleting species",
        description: errMessage,
        variant: "destructive",
      });
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      {currentSpecies.image && (
        <div className="relative h-40 w-full">
          <Image src={currentSpecies.image} alt={currentSpecies.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{currentSpecies.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{currentSpecies.common_name}</h4>
      <p>{currentSpecies.description ? currentSpecies.description.slice(0, 150).trim() + "..." : ""}</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-3 w-full" onClick={() => setOpen(true)}>
            Learn More
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Species Details</DialogTitle>
          </DialogHeader>
          <div className="species-details p-4">
            <p>
              <strong>Scientific Name:</strong> {currentSpecies.scientific_name}
            </p>
            <p>
              <strong>Common Name:</strong> {currentSpecies.common_name ?? "N/A"}
            </p>
            <p>
              <strong>Total Population:</strong>{" "}
              {currentSpecies.total_population ? currentSpecies.total_population.toLocaleString() : "N/A"}
            </p>
            <p>
              <strong>Kingdom:</strong> {currentSpecies.kingdom}
            </p>
            <p>
              <strong>Description:</strong> {currentSpecies.description ?? "No description provided."}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {species.author === sessionId && (
        <>
          <Button className="mt-3 w-full" onClick={() => setOpenEdit(true)}>
            Edit
          </Button>
          <Button className="mt-3 w-full" variant="destructive" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </>
      )}

      <EditSpeciesDialog
        open={openEdit}
        setOpen={setOpenEdit}
        species={currentSpecies}
        onSpeciesUpdated={handleSpeciesUpdated}
      />

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => void handleDeleteSpecies()}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
