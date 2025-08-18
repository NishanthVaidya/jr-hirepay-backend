import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import HiringService from "../services/hiring";
import { useNavigate } from "react-router-dom";

const Schema = Yup.object({
  consultantName: Yup.string().min(2).max(100).required("Full name is required"),
  consultantEmail: Yup.string().email().required("Email is required"),
});

export default function GetHiredStart() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-2">Start your hiring setup</h1>
      <p className="text-gray-600 mb-6">
        Enter your details and we'll create your hiring request.
      </p>

      <Formik
        initialValues={{ consultantName: "", consultantEmail: "" }}
        validationSchema={Schema}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const proc = await HiringService.create(values);
            toast.success("Hiring request created");
            navigate(`/get-hired/${proc.uuid}`);
          } catch (e: any) {
            toast.error(e.message ?? "Failed to create request");
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5 bg-white p-6 rounded-xl shadow">
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <Field
                name="consultantName"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                placeholder="Jane Doe"
              />
              <div className="text-red-600 text-sm mt-1">
                <ErrorMessage name="consultantName" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Field
                name="consultantEmail"
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                placeholder="jane@example.com"
              />
              <div className="text-red-600 text-sm mt-1">
                <ErrorMessage name="consultantEmail" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create request"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

