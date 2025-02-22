import { Flex, Spinner } from "@chakra-ui/react";
import {
  type DehydratedState,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { AppLayout } from "components/app-layouts/app";
import {
  ensQuery,
  fetchAllVersions,
  fetchContractPublishMetadataFromURI,
  fetchPublishedContractInfo,
  publisherProfileQuery,
} from "components/contract-components/hooks";
import {
  PublishWithVersionPage,
  type PublishWithVersionPageProps,
} from "components/pages/publish";
import { PublisherSDKContext } from "contexts/custom-sdk-context";
import { getAddress, isAddress } from "ethers/lib/utils";
import { getDashboardChainRpc } from "lib/rpc";
import { getThirdwebSDK } from "lib/sdk";
import type { GetStaticPaths, GetStaticProps } from "next";
import { PageId } from "page-id";
import { polygon } from "thirdweb/chains";
import type { ThirdwebNextPage } from "utils/types";
import { ContractsSidebar } from "../../core-ui/sidebar/contracts";

type PublishPageProps = {
  dehydratedState: DehydratedState;
} & PublishWithVersionPageProps;

const PublishPage: ThirdwebNextPage = (props: PublishPageProps) => {
  return (
    <PublisherSDKContext>
      <PublishWithVersionPage
        author={props.author}
        contractName={props.contractName}
        version={props.version}
        isDeploy={props.isDeploy}
      />
    </PublisherSDKContext>
  );
};

PublishPage.pageId = PageId.PublishedContract;

PublishPage.getLayout = (page, props: PublishPageProps) => {
  return (
    <AppLayout
      dehydratedState={props.dehydratedState}
      noOverflowX
      pageContainerClassName={props.isDeploy ? "!container" : ""}
      mainClassName={props.isDeploy ? "!pt-0" : ""}
      hasSidebar={!props.isDeploy}
    >
      {!props.isDeploy && <ContractsSidebar />}
      {page}
    </AppLayout>
  );
};

PublishPage.fallback = (
  <AppLayout>
    <Flex h="100%" justifyContent="center" alignItems="center">
      <Spinner size="xl" />
    </Flex>
  </AppLayout>
);

export default PublishPage;

export const getStaticProps: GetStaticProps<PublishPageProps> = async (ctx) => {
  const paths = ctx.params?.paths as string[];
  const [authorAddress, contractName, versionOrDeploy = "", deployStr] = paths;
  let version = "";
  let isDeploy = false;

  if (versionOrDeploy === "deploy") {
    isDeploy = true;
    version = "";
  } else if (versionOrDeploy && deployStr === "deploy") {
    version = versionOrDeploy;
    isDeploy = true;
  }

  if (!contractName) {
    return {
      notFound: true,
    };
  }

  const polygonSdk = getThirdwebSDK(
    polygon.id,
    getDashboardChainRpc(polygon.id, undefined),
  );

  const lowercaseAddress = authorAddress.toLowerCase();
  const checksummedAddress = isAddress(lowercaseAddress)
    ? getAddress(lowercaseAddress)
    : lowercaseAddress;

  const queryClient = new QueryClient();
  const { address, ensName } = await queryClient.fetchQuery(
    ensQuery(checksummedAddress),
  );

  if (!address) {
    return {
      notFound: true,
    } as const;
  }

  // TODO get the latest version instead of all versions
  // OR wait till contract upgrade to have a faster call for this

  let allVersions: ReturnType<typeof fetchAllVersions> extends Promise<infer X>
    ? X
    : never = [];
  try {
    allVersions = await queryClient.fetchQuery(
      ["all-releases", address, contractName],
      () => fetchAllVersions(polygonSdk, address, contractName),
    );
  } catch {
    return {
      notFound: true,
    } as const;
  }

  const publishedContract =
    allVersions.find((v) => v.version === version) || allVersions[0];

  const ensQueries = [queryClient.prefetchQuery(ensQuery(checksummedAddress))];
  if (ensName) {
    ensQueries.push(queryClient.prefetchQuery(ensQuery(ensName)));
  }

  // this can be very slow
  await Promise.all([
    ...ensQueries,
    queryClient.prefetchQuery(["released-contract", publishedContract], () =>
      fetchPublishedContractInfo(polygonSdk, publishedContract),
    ),
    queryClient.prefetchQuery(
      ["publish-metadata", publishedContract.metadataUri],
      () => fetchContractPublishMetadataFromURI(publishedContract.metadataUri),
    ),
    queryClient.prefetchQuery(
      publisherProfileQuery(publishedContract.publisher),
    ),
  ]);

  const props: PublishPageProps = {
    dehydratedState: dehydrate(queryClient),
    author: checksummedAddress,
    contractName,
    version,
    isDeploy,
  };

  return {
    props,
  };
};

// generate the explore contracts at build time
// others will be generated at runtime via fallback
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    fallback: true,
    paths: [],
  };
};
