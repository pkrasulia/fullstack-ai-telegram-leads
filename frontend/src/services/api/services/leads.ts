import { useCallback } from 'react';
import useFetch from '../use-fetch';
import { API_URL } from '../config';
import wrapperFetchJsonResponse from '../wrapper-fetch-json-response';
import { Lead, LeadStatus } from '../types/lead';
import { InfinityPaginationType } from '../types/infinity-pagination';
import { SortEnum } from '../types/sort-type';
import { RequestConfigType } from './types/request-config';

export type LeadsRequest = {
  page: number;
  limit: number;
  filters?: {
    status?: LeadStatus;
  };
  sort?: Array<{
    orderBy: keyof Lead;
    order: SortEnum;
  }>;
};

export type LeadsResponse = InfinityPaginationType<Lead>;

export function useGetLeadsService() {
  const fetch = useFetch();

  return useCallback(
    (data: LeadsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/leads`);
      requestUrl.searchParams.append('page', data.page.toString());
      requestUrl.searchParams.append('limit', data.limit.toString());
      if (data.filters) {
        requestUrl.searchParams.append('filters', JSON.stringify(data.filters));
      }
      if (data.sort) {
        requestUrl.searchParams.append('sort', JSON.stringify(data.sort));
      }

      return fetch(requestUrl, {
        method: 'GET',
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LeadsResponse>);
    },
    [fetch],
  );
}

export type LeadRequest = {
  id: Lead['id'];
};

export type LeadResponse = Lead;

export function useGetLeadService() {
  const fetch = useFetch();

  return useCallback(
    (data: LeadRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/leads/${data.id}`, {
        method: 'GET',
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LeadResponse>);
    },
    [fetch],
  );
}

export type LeadPostRequest = Pick<
  Lead,
  'name' | 'email' | 'phone' | 'telegramUsername' | 'telegramId' | 'company' | 'position' | 'notes' | 'status' | 'source'
>;

export type LeadPostResponse = Lead;

export function usePostLeadService() {
  const fetch = useFetch();

  return useCallback(
    (data: LeadPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/leads`, {
        method: 'POST',
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LeadPostResponse>);
    },
    [fetch],
  );
}

export type LeadPatchRequest = {
  id: Lead['id'];
  data: Partial<
    Pick<Lead, 'name' | 'email' | 'phone' | 'telegramUsername' | 'telegramId' | 'company' | 'position' | 'notes' | 'status' | 'source'>
  >;
};

export type LeadPatchResponse = Lead;

export function usePatchLeadService() {
  const fetch = useFetch();

  return useCallback(
    (data: LeadPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/leads/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LeadPatchResponse>);
    },
    [fetch],
  );
}

export type LeadsDeleteRequest = {
  id: Lead['id'];
};

export type LeadsDeleteResponse = undefined;

export function useDeleteLeadsService() {
  const fetch = useFetch();

  return useCallback(
    (data: LeadsDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/leads/${data.id}`, {
        method: 'DELETE',
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LeadsDeleteResponse>);
    },
    [fetch],
  );
}

export type LeadByTelegramIdRequest = {
  telegramId: string;
};

export type LeadByTelegramIdResponse = Lead;

export function useGetLeadByTelegramIdService() {
  const fetch = useFetch();

  return useCallback(
    (data: LeadByTelegramIdRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/leads/telegram/${data.telegramId}`, {
        method: 'GET',
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LeadByTelegramIdResponse>);
    },
    [fetch],
  );
}

export type LeadByEmailRequest = {
  email: string;
};

export type LeadByEmailResponse = Lead;

export function useGetLeadByEmailService() {
  const fetch = useFetch();

  return useCallback(
    (data: LeadByEmailRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/leads/email/${data.email}`, {
        method: 'GET',
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LeadByEmailResponse>);
    },
    [fetch],
  );
}

export type LeadsByStatusRequest = {
  status: LeadStatus;
};

export type LeadsByStatusResponse = Lead[];

export function useGetLeadsByStatusService() {
  const fetch = useFetch();

  return useCallback(
    (data: LeadsByStatusRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/leads?status=${data.status}`, {
        method: 'GET',
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LeadsByStatusResponse>);
    },
    [fetch],
  );
}