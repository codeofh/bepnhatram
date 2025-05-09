import React, { useState } from "react";
import { db, isFirebaseInitialized } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToastContext } from "@/contexts/ToastContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Info, Database, AlertTriangle, Check } from "lucide-react";

const SETTINGS_DOC_ID = "site-settings";
const SETTINGS_COLLECTION = "settings";

export const SettingsDebugPanel = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const { showSuccess, showError } = useToastContext();

  const runDiagnostics = async () => {
    setIsChecking(true);
    const diagnosticResults: Record<string, any> = {};
    const startTime = new Date().toISOString();

    console.log(`[SettingsDebug][${startTime}] Running settings diagnostics`);

    try {
      // Check Firebase initialization
      diagnosticResults.firebaseFunction =
        typeof isFirebaseInitialized === "function";

      if (diagnosticResults.firebaseFunction) {
        diagnosticResults.firebaseInitialized = isFirebaseInitialized();
        console.log(
          `[SettingsDebug] Firebase initialized: ${diagnosticResults.firebaseInitialized}`,
        );
      } else {
        console.error(
          "[SettingsDebug] isFirebaseInitialized is not a function!",
        );
        diagnosticResults.error = "isFirebaseInitialized is not a function";
      }

      // Check Firestore instance
      diagnosticResults.firestoreAvailable = !!db;
      console.log(
        `[SettingsDebug] Firestore available: ${diagnosticResults.firestoreAvailable}`,
      );

      if (db) {
        try {
          // Try to read settings document
          console.log(
            `[SettingsDebug] Attempting to read settings document from ${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`,
          );
          const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
          const docSnap = await getDoc(docRef);

          diagnosticResults.documentExists = docSnap.exists();
          console.log(
            `[SettingsDebug] Settings document exists: ${diagnosticResults.documentExists}`,
          );

          if (docSnap.exists()) {
            diagnosticResults.documentData = docSnap.data();
            console.log("[SettingsDebug] Document data retrieved successfully");
          }

          // Try a simple write operation
          const testDocRef = doc(db, SETTINGS_COLLECTION, "debug-test");
          await setDoc(testDocRef, {
            test: true,
            timestamp: new Date(),
            message: "Settings debug test",
          });

          diagnosticResults.writeSuccessful = true;
          console.log("[SettingsDebug] Test write successful");

          // Check for permission issues
          if (
            diagnosticResults.writeSuccessful &&
            !diagnosticResults.documentExists
          ) {
            diagnosticResults.recommendation =
              "The settings document does not exist. Create it first with a basic write.";
          } else if (
            !diagnosticResults.writeSuccessful &&
            diagnosticResults.documentExists
          ) {
            diagnosticResults.recommendation =
              "You have read permission but not write permission.";
          }
        } catch (firestoreError: any) {
          console.error(
            "[SettingsDebug] Firestore operation error:",
            firestoreError,
          );
          diagnosticResults.firestoreError = {
            code: firestoreError.code,
            message: firestoreError.message,
          };

          if (firestoreError.code === "permission-denied") {
            diagnosticResults.recommendation =
              "Update your Firestore security rules to allow writes to the settings collection.";
          }
        }
      }
    } catch (error: any) {
      console.error(
        "[SettingsDebug] Unexpected error during diagnostics:",
        error,
      );
      diagnosticResults.unexpectedError = {
        message: error.message,
        stack: error.stack,
      };
    } finally {
      setIsChecking(false);
      setResults(diagnosticResults);
      console.log(
        `[SettingsDebug][${startTime}] Diagnostics completed:`,
        diagnosticResults,
      );
    }
  };

  const testMinimalUpdate = async () => {
    setIsChecking(true);
    console.log("[SettingsDebug] Testing minimal update with only one field");

    try {
      if (!db) {
        showError("Firestore is not available");
        return;
      }

      // Try to update just the name field
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      await setDoc(
        docRef,
        {
          name: "Debug Test " + new Date().toLocaleTimeString(),
          updatedAt: new Date(),
        },
        { merge: true },
      );

      showSuccess("Test update successful!");
      console.log("[SettingsDebug] Minimal update completed successfully");
    } catch (error: any) {
      console.error("[SettingsDebug] Error during test update:", error);
      showError(`Test update failed: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Settings Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={runDiagnostics}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Info className="mr-2 h-4 w-4" />
                  Run Diagnostics
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={testMinimalUpdate}
              disabled={isChecking}
            >
              <Database className="mr-2 h-4 w-4" />
              Test Minimal Update
            </Button>
          </div>

          {Object.keys(results).length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="results">
                <AccordionTrigger>Diagnostic Results</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(results).map(([key, value]) => {
                      if (
                        key === "documentData" ||
                        key === "firestoreError" ||
                        key === "unexpectedError"
                      ) {
                        return (
                          <div key={key} className="border p-2 rounded">
                            <div className="font-semibold">{key}:</div>
                            <pre
                              className="text-xs overflow-auto bg-gray-50 p-2 rounded mt-1"
                              style={{ maxHeight: "100px" }}
                            >
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={key}
                          className="flex items-start border-b border-gray-100 pb-1"
                        >
                          <span className="mr-2">
                            {typeof value === "boolean" ? (
                              value ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              )
                            ) : (
                              <span className="w-4 inline-block"></span>
                            )}
                          </span>
                          <div>
                            <span className="font-medium">{key}: </span>
                            <span>
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
