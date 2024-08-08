import { Flex, useDisclosure } from "@chakra-ui/react";
import type { NFT, ThirdwebContract } from "thirdweb";
import { Button, Drawer, Text } from "tw-components";
import { UpdateNftMetadata } from "./update-metadata-form";

interface UpdateMetadataTabProps {
  contract: ThirdwebContract;
  nft: NFT;
}

const UpdateMetadataTab: React.FC<UpdateMetadataTabProps> = ({
  contract,
  nft,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Drawer
        allowPinchZoom
        preserveScrollBarGap
        size="lg"
        onClose={onClose}
        isOpen={isOpen}
      >
        <UpdateNftMetadata contract={contract} nft={nft} />
      </Drawer>
      <Flex direction={"column"} gap={6}>
        <Text>
          You can update the metadata of this NFT at any time, this will only
          change the representation of the NFT, not the owner or tokenId.
        </Text>
        <Flex justifyContent={"right"}>
          <Button colorScheme="primary" onClick={onOpen}>
            Update Metadata
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

export default UpdateMetadataTab;
